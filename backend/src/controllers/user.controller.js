import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import nodeMailer from "nodemailer"

// Generate Access and Refresh Tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Error generating tokens");
    }
};
// Generate random otp
const generateotp = () => {
    const characters = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    }
    return otp;
}

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, isVerified } = req.body;

    if ([username, email, password].some((field) => !field?.trim())) {
        throw new apiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) throw new apiError(409, "User already exists");

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        verified: isVerified
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) throw new apiError(500, "Error registering user");
    return res
        .status(201)
        .json(new apiResponse(201, createdUser, "User registered successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new apiError(400, "Username or Email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new apiError(400, "Invalid username or email");

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new apiError(400, "Incorrect password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "user logged in successfully"));
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null }, { new: true });

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

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(200, { user: req.user }, "User fetched successfully"));
});

// Send OTP
const sendOtp = asyncHandler(async (req, res) => {
    const email = req.query.email;

    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: "yellow06jacket@gmail.com",
            pass: "utnk wfpt hlfq hqae",
        },
    });
    const otp = generateotp();
    const info = await transporter.sendMail({
        from: '"Mystic Feedback 👻" <mysticfeedback@gmail.com>', // Sender address
        to: `${email}`, // List of receivers
        subject: "OTP for Registration", // Subject line
        text: `Dear User,
        
    This is your one-time password (OTP): ${otp}.
    Please do not share the OTP with others.
    
    Regards,
    Team Mystic Feedback`, // Plain text body

        html: `<p>Dear User,</p>
    <p>This is your one-time password (OTP): <b>${otp}</b>.</p>
    <p>Please do not share the OTP with others.</p>
    <p>Regards,</p>
    <p><b>Team Mystic Feedback</b></p>`, // HTML body
    });


    return res
        .status(200)
        .json(new apiResponse(200, { info, otp }, "Otp Sent successfully"));


});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    sendOtp
};