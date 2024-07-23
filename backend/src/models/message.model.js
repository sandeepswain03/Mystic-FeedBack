import { Schema, model } from "mongoose";

const messageSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            maxLength: [200, "Message should be at most 200 characters long"]
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

export const Message = model("Message", messageSchema);
