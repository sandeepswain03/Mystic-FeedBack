import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Question } from "../models/question.model.js";
import PDFDocument from 'pdfkit'

const updateMessageAcceptance = asyncHandler(async (req, res) => {

    const { acceptMessages, questionId } = req.body;

    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        )

        if (!updatedQuestion) {
            throw new apiError(
                404,
                "Unable to find Question to update message acceptance status"
            );
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    updatedQuestion,
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
    const queId = req.params.questionId;

    try {
        const messages = await Question.findById(queId)
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 } }
            })
            .select("messages");


        if (!messages) {
            throw new apiError(404, "Messages not found");
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    { messages },
                    "Messages retrieved successfully"
                )
            );
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        throw new apiError(500, "Internal server error");
    }
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { questionId } = req.body;
    const messageId = req.params.messageId;
    try {
        // First, remove the message reference from the user's messages array
        const updateResult = await Question.updateOne(
            { _id: questionId },
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

const deleteAllMessages = asyncHandler(async (req, res) => {
    const { questionId } = req.body;
    try {
        // Find the user and get all message IDs
        const question = await Question.findById(questionId);

        if (!question) {
            throw new apiError(404, "Question not found");
        }

        const messageIds = question.messages;

        if (messageIds.length === 0) {
            return res
                .status(200)
                .json(new apiResponse(200, null, "No messages to delete"));
        }

        // Remove all message references from the user's messages array
        await Question.updateOne(
            { _id: questionId },
            { $set: { messages: [] } } // Clear the messages array
        );

        // Delete all message documents
        const deleteResult = await Message.deleteMany({ _id: { $in: messageIds } });

        if (deleteResult.deletedCount === 0) {
            throw new apiError(404, "Messages not found or already deleted");
        }

        return res
            .status(200)
            .json(new apiResponse(200, null, "All messages deleted successfully"));
    } catch (error) {
        console.error("Error deleting all messages:", error);
        throw new apiError(500, "Error deleting all messages");
    }



});

const questionUpdate = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { question } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { question: question },
            { new: true }
        ).select("-password -refreshToken");
        if (updatedUser) {
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        { updatedUser },
                        "Question acceptance status updated successfully"
                    )
                );
        }

    } catch (error) {
        console.error("Error updating Question acceptance status:", error);
        throw new apiError(500, "Error updating Question acceptance status");
    }
})

const pdfGenerate = asyncHandler(async (req, res) => {
    try {
        const questionId = req.query.questionId;
        const doc = new PDFDocument();

        const messages = await Message.find({ queOwner: questionId });

        // Add content to the PDF
        messages.forEach((message, index) => {
            doc.text(`Message ${index + 1}: ${message.content}`);
        });

        // Set headers for PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=messages.pdf");

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Finalize the PDF and close the stream
        doc.end();
    } catch (error) {
        console.log(error);

    }

})

const createQuestion = asyncHandler(async (req, res) => {
    try {
        const { question } = req.body;
        console.log(question);

        const createdQuestion = await Question.create({
            owner: req.user._id,
            content: question
        });
        const updatedUser = await User.updateOne(
            { _id: req.user._id },
            { $push: { question: createdQuestion._id } }
        );
        return res
            .status(200)
            .json(
                new apiResponse(201, createdQuestion, "Question instance Created")
            )

    } catch (error) {
        console.log(error.message);
    }

});

const fetchAllQuestion = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('question');

        if (user) {
            const questions = user.question;

            // Use map to return a promise for each question and await Promise.all
            const questionArr = await Promise.all(questions.map(async (e) => {
                const content = await Question.findById(e)
                return content

            }));

            return res
                .status(200)
                .json(
                    new apiResponse(200, questionArr, "question fetched")
                );
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
});

const deleteQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.body;

    try {
        // Step 1: Find the question by its ID
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const userId = question.owner; // Assuming 'user' field stores the owner's ID

        // Step 2: Delete all messages associated with this question
        await Message.deleteMany({ _id: { $in: question.messages } });

        // Step 3: Remove the question ID from the user's 'questions' array
        await User.findByIdAndUpdate(userId, { $pull: { question: questionId } });

        // Step 4: Delete the question itself
        await Question.findByIdAndDelete(questionId);

        return res.status(200).json({ message: 'Question and associated Feedbacks deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


export {
    getMessages,
    updateMessageAcceptance,
    getMessageAcceptanceStatus,
    deleteMessage,
    deleteAllMessages,
    questionUpdate,
    pdfGenerate,
    createQuestion,
    fetchAllQuestion,
    deleteQuestion

};
