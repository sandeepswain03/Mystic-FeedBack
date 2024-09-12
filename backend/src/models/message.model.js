import { Schema, model } from "mongoose";

const messageSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            maxLength: [200, "Message should be at most 200 characters long"]
        },
        queOwner: {
            type: Schema.Types.ObjectId,
            ref: "Question"
        }
    },
    { timestamps: true }
);

export const Message = model("Message", messageSchema);
