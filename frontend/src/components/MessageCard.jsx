import { useState } from "react";
import PropTypes from "prop-types";
import { axiosInstance } from "../axiosInstance";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { FiTrash2, FiClock, FiX } from "react-icons/fi";

function MessageCard({ message, questionId, onDelete }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showFullMessage, setShowFullMessage] = useState(false);

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/dashboard/messages/${message._id}`, {
                data: {
                    questionId: questionId
                }
            });
            setShowConfirm(false);
            onDelete(message._id);
            toast.success("Message deleted successfully");
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        }
    };

    const truncatedContent =
        message.content.length > 30
            ? `${message.content.substring(0, 30)}...`
            : message.content;

    return (
        <div className="bg-[#3C3B38] shadow-md rounded-lg p-4 mb-4 relative hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-[#afa18f] mb-2 flex items-center">
                <FiClock className="mr-1" />
                {dayjs(message.createdAt).format("DD/MM/YYYY HH:mm")}
            </div>
            <p
                className="text-[#f0f0f0] mb-3 cursor-pointer hover:text-[#ec4e39] transition-colors duration-200"
                onClick={() => setShowFullMessage(true)}
            >
                {truncatedContent}
            </p>
            <button
                onClick={() => setShowConfirm(true)}
                className="bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-white px-3 py-1 rounded-full text-sm hover:shadow-lg transition-all duration-200 flex items-center"
                aria-label="Delete message"
            >
                <FiTrash2 className="mr-1" /> Delete
            </button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#2C2B28] p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-[#ec4e39] text-xl font-semibold mb-3 flex items-center">
                            <FiTrash2 className="mr-2" /> Confirm Deletion
                        </h3>
                        <p className="text-[#afa18f] mb-4">
                            Are you sure you want to delete this message? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-4 py-2 rounded-full hover:bg-[#4C4B48] transition-colors duration-200 flex items-center"
                            >
                                <FiX className="mr-1" /> Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-white px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg flex items-center"
                            >
                                <FiTrash2 className="mr-1" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFullMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#2C2B28] p-6 rounded-lg shadow-xl max-w-2xl w-full relative overflow-y-auto max-h-[80vh]">
                        <button
                            onClick={() => setShowFullMessage(false)}
                            className="absolute top-2 right-2 text-[#afa18f] hover:text-[#ec4e39] transition-colors duration-200"
                            aria-label="Close full message"
                        >
                            <FiX size={24} />
                        </button>
                        <h3 className="text-[#ec4e39] text-xl font-semibold mb-3 flex items-center">
                            <FiClock className="mr-2" /> Full Message
                        </h3>
                        <p className="text-[#f0f0f0] mb-4 whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                        <div className="text-sm text-[#afa18f] mt-4">
                            Received on: {dayjs(message.createdAt).format("DD/MM/YYYY HH:mm")}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

MessageCard.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired
    }).isRequired,
    questionId: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default MessageCard;
