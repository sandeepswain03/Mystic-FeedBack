import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import mongoose from "mongoose";

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

    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
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

const getMessages = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    try {
        const user = await User.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ]).exec();

        if (!user || user.length === 0) {
            throw new apiError(404, "User not found");
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    { messages: user[0].messages },
                    "Messages retrieved successfully"
                )
            );
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        throw new apiError(500, "Internal server error");
    }
});

const updateMessageAcceptance = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { acceptMessages } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAcceptingMesasge: acceptMessages },
            { new: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            throw new apiError(
                404,
                "Unable to find user to update message acceptance status"
            );
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    { updatedUser },
                    "Message acceptance status updated successfully"
                )
            );
    } catch (error) {
        console.error("Error updating message acceptance status:", error);
        throw new apiError(500, "Error updating message acceptance status");
    }
});

const getMessageAcceptanceStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select("isAcceptingMesasge");

        if (!user) {
            throw new apiError(404, "User not found");
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    { isAcceptingMessages: user.isAcceptingMesasge },
                    "Message acceptance status retrieved successfully"
                )
            );
    } catch (error) {
        console.error("Error retrieving message acceptance status:", error);
        throw new apiError(500, "Error retrieving message acceptance status");
    }
});

const deleteMessage = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { messageId } = req.params;

    try {
        const updateResult = await User.updateOne(
            { _id: userId },
            { $pull: { messages: { _id: messageId } } }
        );

        if (updateResult.modifiedCount === 0) {
            throw new apiError(404, "Message not found or already deleted");
        }

        return res
            .status(200)
            .json(new apiResponse(200, null, "Message deleted successfully"));
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new apiError(500, "Error deleting message");
    }
});

const sendMessage = asyncHandler(async (req, res) => {
    const { username, content } = req.body;

    try {
        const user = await User.findOne({ username }).exec();

        if (!user) {
            throw new apiError(404, "User not found");
        }

        // Check if the user is accepting messages
        if (!user.isAcceptingMesasge) {
            throw new apiError(403, "User is not accepting messages");
        }

        const newMessage = { content, createdAt: new Date() };

        // Push the new message to the user's messages array
        user.messages.push(newMessage);
        await user.save();

        return res
            .status(201)
            .json(new apiResponse(201, null, "Message sent successfully"));
    } catch (error) {
        console.error("Error adding message:", error);
        throw new apiError(500, "Internal server error");
    }
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

export {
    registerUser,
    loginUser,
    logoutUser,
    getMessages,
    updateMessageAcceptance,
    getMessageAcceptanceStatus,
    deleteMessage,
    sendMessage,
    refreshAccessToken,
    getCurrentUser
};
