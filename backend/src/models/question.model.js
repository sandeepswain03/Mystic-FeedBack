import { Schema, model } from "mongoose";

const questionSchema = new Schema(
    {
        content: {
            type: String,
            maxLength: [200, "Question should be at most 200 characters long"],
            default: ""
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message"
            }
        ],
        isAcceptingMessages: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Question = model("Question", questionSchema);