import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) throw new apiError(409, "User already exists");

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) throw new apiError(500, "Error registering user");
    return res
        .status(201)
        .json(
            new apiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new apiError(400, "username or email are required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new apiError(400, "Invalid username or password");

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new apiError(400, "Incorrect password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const LoggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                "200",
                { user: LoggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request");
    }

    const user = await User.findOne({
        refreshToken: incomingRefreshToken
    });

    if (!user) {
        throw new apiError(401, "User not found from refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Access token refreshed successfully"
            )
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { user: req.user },
                "User fetched successfully"
            )
        );
});

const sendMessage = asyncHandler(async (req, res) => {
    const { username, content } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            throw new apiError(404, "User not found");
        }

        // Check if the user is accepting messages
        if (!user.isAcceptingMessages) {
            throw new apiError(403, "User is not accepting messages");
        }

        // Create a new message document
        const newMessage = await Message.create({
            content,
            owner: user._id
        });

        // Push the new message's _id to the user's messages array
        user.messages.push(newMessage._id);
        await user.save();

        return res
            .status(201)
            .json(new apiResponse(201, null, "Message sent successfully"));
    } catch (error) {
        console.error("Error adding message:", error);
        throw new apiError(500, "Internal server error");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    sendMessage,
    refreshAccessToken,
    getCurrentUser
};
 