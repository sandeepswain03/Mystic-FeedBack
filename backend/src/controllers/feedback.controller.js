import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Question } from "../models/question.model.js";


const getQuestion = asyncHandler(async (req, res) => {
    try {
        const { queId } = req.query
        const question = await Question.findById(queId);

        return res
            .status(200)
            .json(
                new apiResponse(200, question, "question fetched Successfully")
            );

    } catch (error) {
        console.log(error);

    }
});
const getUserName = asyncHandler(async (req, res) => {
    try {
        const { Id } = req.query
        console.log(Id);

        const user = await User.findById(Id).select("username");
        const userName = user.username;

        return res
            .status(200)
            .json(
                new apiResponse(200, userName, "question fetched Successfully")
            );

    } catch (error) {
        console.log("Error Getting userName", error);

    }
});
const sendMessage = asyncHandler(async (req, res) => {
    const { questionId, content } = req.body;

    try {
        const question = await Question.findById(questionId)

        if (question) {
            try {
                const newMessage = await Message.create({
                    content,
                    queOwner: questionId
                });
                const updateQuestion = await Question.findByIdAndUpdate(
                    questionId,
                    { $push: { messages: newMessage._id } }
                )
            } catch (error) {
                console.log("Error while creating new Message And updating message in Question", error);

            }
        }

        return res
            .status(201)
            .json(new apiResponse(201, null, "Message sent successfully"));

    } catch (error) {
        console.error("Error adding message:", error);
        throw new apiError(500, "Internal server error");
    }
})



export {
    getQuestion,
    getUserName,
    sendMessage
}