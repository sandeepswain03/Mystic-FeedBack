import { useContext, useEffect, useState, useCallback } from "react";
import UserContext from "../../contexts/userContext";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../axiosInstance";
import Switch from "react-switch";
import MessageCard from "../MessageCard";
import { FiRefreshCw, FiCopy } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [acceptMessages, setAcceptMessages] = useState(true);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [questionInput, setQuestionInput] = useState("");
    const [questions, setQuestions] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [showLinkConfirm, setShowLinkConfirm] = useState(false)
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [showDeleteQueConfirm, setShowDeleteQueConfirm] = useState(false);
    const [queIdToDelete, setQueIdToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchMessages = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        try {
            if (activeQuestion) {
                const response = await axiosInstance.get(`/dashboard/messages/${activeQuestion._id}`);
                setMessages(response.data.data.messages.messages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [activeQuestion]);

    const fetchQuestions = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/dashboard/fetchAllQuestion");
            setQuestions(response.data.data);
        } catch (error) {
            console.log(error.message);
        }
    }, [])

    useEffect(() => {
        fetchQuestions();
        if (activeQuestion) {
            fetchMessages();
            setAcceptMessages(activeQuestion ? activeQuestion.isAcceptingMessages : true)
        }
    }, [activeQuestion, fetchMessages]);

    const handleAddQuestion = async () => {
        setQuestionInput("");
        setMessages([]);
        setActiveQuestion(null);
    };

    const handleSaveQuestion = async () => {
        if (questionInput.trim() === "") {
            toast.error("Question cannot be empty");
            return;
        }
        const newQuestion = await axiosInstance.post("/dashboard/createQuestion", {
            question: questionInput
        });
        setActiveQuestion(newQuestion.data.data)
        setQuestions([newQuestion.data.data, ...questions]);
        setQuestionInput("")
        toast.success("Question Saved Successfully")
    };

    const handleSwitchChange = async (checked) => {
        try {
            const updated = await axiosInstance.put("/dashboard/message-acceptance", { acceptMessages: checked, questionId: activeQuestion._id });
            setAcceptMessages(checked);
            setActiveQuestion((prev) => ({
                ...prev,
                isAcceptingMessages: checked,
            }));
            toast.success("Message acceptance status updated");
        } catch (error) {
            console.error("Error updating message acceptance status:", error);
            toast.error("Failed to update message acceptance status");
        }
    };

    const downloadMessages = async () => {
        try {
            const response = await axiosInstance.get("/dashboard/pdf-generate", {
                params: activeQuestion ? { questionId: activeQuestion._id } : toast.error("Unable To Download"),
                responseType: "blob",
            });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "messages.pdf");

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF Exported successfully");
        } catch (error) {
            console.error("Error downloading the PDF:", error);
        }
    };

    const refreshMessages = () => {
        fetchMessages(true);
    };

    const deleteAllMessagesAndRefresh = async () => {
        try {
            await axiosInstance.delete("/dashboard/deleteAllMessages", {
                data: {
                    questionId: activeQuestion._id
                }
            });
            refreshMessages();
            toast.success("All Messages Deleted successfully");
            setShowDeleteAllConfirm(false);
        } catch (error) {
            console.error("Error deleting messages:", error);
        }
    };

    const generateLink = async () => {
        setShowLinkConfirm(true)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(activeQuestion ? `${window.location.protocol}//${window.location.host}/profile/${activeQuestion._id}` : toast.error("Unable to copy Link"));
        toast.success("Link copied to clipboard");
    };

    const handleDeleteMessage = (messageId) => {
        setMessages(messages.filter((message) => message._id !== messageId));
    };

    const handelDeleteQuestion = async () => {
        try {
            await axiosInstance.delete("/dashboard/deleteQuestion", {
                data: {
                    questionId: queIdToDelete
                }
            });
            setActiveQuestion(null);
            setQueIdToDelete(null)
            setShowDeleteQueConfirm(false);
            toast.success("Question Deleted successfully");
        } catch (error) {
            console.error("Error deleting Question:", error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col lg:flex-row">
            {/* Aside Panel for Questions */}
            <aside className="w-full lg:w-1/4 p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-700">
                <button
                    onClick={handleAddQuestion}
                    className="bg-blue-500 text-white p-2 w-full rounded-md hover:bg-blue-600 mb-4"
                >
                    Add New Question
                </button>
                <h2 className="text-xl lg:text-2xl font-semibold mb-4">Your Questions</h2>
                <div className="space-y-4">
                    {questions.map((q) => (
                        <div
                            key={q._id}
                            onClick={() => setActiveQuestion(q)}
                            className={`p-4 rounded-md cursor-pointer ${activeQuestion?._id === q._id ? "bg-blue-600" : "bg-gray-700"}`}
                        >
                            <div className="flex justify-between items-center">
                                <span>{q.content || "New Question"}</span>
                                <button
                                    onClick={(e) => {
                                        // e.stopPropagation(); // Prevents triggering setActiveQuestion when delete button is clicked
                                        setQueIdToDelete(q._id);// Call the delete handler with the question's ID
                                        setShowDeleteQueConfirm(true);
                                    }}
                                    className="bg-red-500 text-white p-2 hover:bg-red-600 transition-colors duration-200 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Section */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <h1 className="text-3xl font-bold p-4 lg:p-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                    Dashboard
                </h1>
                <section className="flex-1 flex flex-col p-4 lg:px-8">
                    {/* Input Bar for Adding Questions */}
                    <div className="flex items-center space-x-4 mb-4">
                        <input
                            type="text"
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            className="flex-1 p-2 rounded-md bg-gray-700 text-white"
                            placeholder={activeQuestion ? activeQuestion.content : "Enter your Question"}
                        />
                        {!activeQuestion && (<button
                            onClick={handleSaveQuestion}
                            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                        >
                            Save Question
                        </button>)}
                        {activeQuestion && (<button
                            className="bg-gray-700 text-white p-2 rounded-md hover:bg-gray-600"
                            onClick={generateLink}
                        >
                            Generate Link
                        </button>)}
                    </div>

                    {/* Toggle Accept Messages and Delete All Button */}
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl lg:text-2xl font-semibold">Accept Feedback</h2>
                            <Switch
                                onChange={handleSwitchChange}
                                checked={activeQuestion ? activeQuestion.
                                    isAcceptingMessages : true}
                                onColor="#4CAF50"
                                offColor="#ccc"
                                onHandleColor="#fff"
                                offHandleColor="#fff"
                                handleDiameter={20}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={28}
                                width={52}
                                className="react-switch"
                                id="acceptMessages"
                            />
                        </div>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                            onClick={() => { setShowDeleteAllConfirm(true) }}
                        >
                            Delete All Messages
                        </button>
                        <button
                            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                            onClick={downloadMessages}
                        >
                            Export Messages
                        </button>
                        <button
                            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                            onClick={refreshMessages}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <AiOutlineLoading3Quarters className="h-4 w-4 lg:h-5 lg:w-5 animate-spin mr-2" />
                            ) : (
                                <FiRefreshCw className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            )}
                            Refresh
                        </button>
                    </div>

                    {/* Display Messages */}
                    <div className="flex-1 overflow-y-auto">
                        {messages.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {messages.map((message) => (
                                    <MessageCard
                                        questionId={activeQuestion ? activeQuestion._id : ""}
                                        message={message}
                                        onDelete={handleDeleteMessage} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center">No messages yet.</p>
                        )}
                    </div>
                </section>
            </main>

            {showLinkConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-white text-xl font-semibold mb-4">Generated Link</h3>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={activeQuestion ? `${window.location.protocol}//${window.location.host}/profile/${activeQuestion._id}` : "Save the question to Generate URL"}
                                readOnly
                                className="bg-gray-700 text-white px-4 py-2 w-full rounded"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                                onClick={copyToClipboard}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200 w-full sm:w-auto"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowLinkConfirm(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-white text-xl font-semibold mb-4">Confirm Deletion</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete All this message? This action cannot be undone.</p>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                                onClick={deleteAllMessagesAndRefresh}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 w-full sm:w-auto"
                            >
                                Delete All Messages
                            </button>
                            <button
                                onClick={() => setShowDeleteAllConfirm(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteQueConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-white text-xl font-semibold mb-4">Confirm Deletion</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete this Question? This action will delete all the feedbacks of this Question and this action cannot be undone.</p>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                                onClick={handelDeleteQuestion}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 w-full sm:w-auto"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteQueConfirm(false)}
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

export default Dashboard;
