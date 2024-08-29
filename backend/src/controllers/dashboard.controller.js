import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

const updateMessageAcceptance = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { acceptMessages } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
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
    console.log("Hello");
    
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select("isAcceptingMessages");

        if (!user) {
            throw new apiError(404, "User not found");
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    { isAcceptingMessages: user.isAcceptingMessages },
                    "Message acceptance status retrieved successfully"
                )
            );
    } catch (error) {
        console.error("Error retrieving message acceptance status:", error);
        throw new apiError(500, "Error retrieving message acceptance status");
    }
});

const getMessages = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId)
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 } }
            })
            .select("messages");

        if (!user) {
            throw new apiError(404, "User not found");
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    { messages: user.messages },
                    "Messages retrieved successfully"
                )
            );
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        throw new apiError(500, "Internal server error");
    }
});

const deleteMessage = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { messageId } = req.params;

    try {
        // First, remove the message reference from the user's messages array
        const updateResult = await User.updateOne(
            { _id: userId },
            { $pull: { messages: messageId } }
        );

        if (updateResult.modifiedCount === 0) {
            throw new apiError(404, "Message not found or already deleted");
        }

        // Then, delete the actual message document
        const deleteResult = await Message.findByIdAndDelete(messageId);

        if (!deleteResult) {
            throw new apiError(404, "Message not found");
        }

        return res
            .status(200)
            .json(new apiResponse(200, null, "Message deleted successfully"));
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new apiError(500, "Error deleting message");
    }
});

export {
    getMessages,
    updateMessageAcceptance,
    getMessageAcceptanceStatus,
    deleteMessage
};
