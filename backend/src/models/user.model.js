import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        minLength: [4, "Username should be at least 4 characters long"], 
        match: [/^[a-zA-Z0-9_]+$/, "username should not contain special characters"]
    },
    fullName: {
        type: String,
        required: [true, "Fullname is required"],
        trim: true,
        index: true,
        minLength: [4, "Fullname should be at least 4 characters long"],
        match: [/^[a-zA-Z0-9_]+$/, "Fullname should not contain special characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    verifyCode: {
        type: String
    },
    verifyCodeExpirty: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMesasge: {
        type: Boolean,
        default: true
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
});

export const User = model("User", userSchema);
