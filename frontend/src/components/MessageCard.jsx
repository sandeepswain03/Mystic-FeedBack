import { useState } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../axiosInstance";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { FiTrash2, FiClock } from "react-icons/fi";

function MessageCard({ message, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/dashboard/messages/${message._id}`);
      onDelete(message._id);
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-4 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-gray-700 px-3 py-1 rounded-bl-lg text-xs text-gray-300 flex items-center">
        <FiClock className="mr-1" />
        {dayjs(message.createdAt).format("DD/MM/YYYY HH:mm")}
      </div>
      <p className="text-gray-200 mb-6 text-lg leading-relaxed">{message.content}</p>
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-400 hover:text-red-600 transition-colors duration-200 flex items-center"
          aria-label="Delete message"
        >
          <FiTrash2 size={20} className="mr-2" />
          <span className="text-sm">Delete</span>
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-white text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 w-full sm:w-auto"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto"
              >
                Cancel
              </button>
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
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default MessageCard;
