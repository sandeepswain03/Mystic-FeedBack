import { useContext, useEffect, useState, useCallback } from "react";
import UserContext from "../../contexts/userContext";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../axiosInstance";
import Switch from "react-switch";
import MessageCard from "../MessageCard";
import {
    FiRefreshCw,
    FiCopy,
    FiMenu,
    FiPlus,
    FiTrash2,
    FiLink
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [acceptMessages, setAcceptMessages] = useState(true);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [questionInput, setQuestionInput] = useState("");
    const [questions, setQuestions] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [showLinkConfirm, setShowLinkConfirm] = useState(false);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [showDeleteQueConfirm, setShowDeleteQueConfirm] = useState(false);
    const [queIdToDelete, setQueIdToDelete] = useState(null);
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const fetchMessages = useCallback(
        async (showLoading = false) => {
            if (showLoading) setIsLoading(true);
            try {
                if (activeQuestion) {
                    const response = await axiosInstance.get(
                        `/dashboard/messages/${activeQuestion._id}`
                    );
                    setMessages(response.data.data.messages.messages);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                if (showLoading) setIsLoading(false);
            }
        },
        [activeQuestion]
    );

    const fetchQuestions = useCallback(async () => {
        try {
            const response = await axiosInstance.get(
                "/dashboard/fetchAllQuestion"
            );
            setQuestions(response.data.data);
        } catch (error) {
            console.log(error.message);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
        if (activeQuestion) {
            fetchMessages();
            setAcceptMessages(
                activeQuestion ? activeQuestion.isAcceptingMessages : true
            );
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
        const newQuestion = await axiosInstance.post(
            "/dashboard/createQuestion",
            {
                question: questionInput
            }
        );
        setActiveQuestion(newQuestion.data.data);
        setQuestions([newQuestion.data.data, ...questions]);
        setQuestionInput("");
        toast.success("Question Saved Successfully");
    };

    const handleSwitchChange = async (checked) => {
        try {
            const updated = await axiosInstance.put(
                "/dashboard/message-acceptance",
                { acceptMessages: checked, questionId: activeQuestion._id }
            );
            setAcceptMessages(checked);
            setActiveQuestion((prev) => ({
                ...prev,
                isAcceptingMessages: checked
            }));
            toast.success("Message acceptance status updated");
        } catch (error) {
            console.error("Error updating message acceptance status:", error);
            toast.error("Failed to update message acceptance status");
        }
    };

    const downloadMessages = async () => {
        try {
            const response = await axiosInstance.get(
                "/dashboard/pdf-generate",
                {
                    params: activeQuestion
                        ? { questionId: activeQuestion._id }
                        : toast.error("Unable To Download"),
                    responseType: "blob"
                }
            );
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
        setShowLinkConfirm(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(
            activeQuestion
                ? `${window.location.protocol}//${window.location.host}/profile/${activeQuestion._id}`
                : toast.error("Unable to copy Link")
        );
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
            setQueIdToDelete(null);
            setShowDeleteQueConfirm(false);
            toast.success("Question Deleted successfully");
        } catch (error) {
            console.error("Error deleting Question:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-[#f0f0f0] flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-16"
                    } transition-all duration-300 ease-in-out bg-[#2C2B28] p-4 flex flex-col shadow-lg h-screen`}
            >
                <button
                    onClick={toggleSidebar}
                    className="mb-8 text-[#ec4e39] hover:text-[#d43d2a] transition-colors duration-200 self-end"
                >
                    <FiMenu size={28} />
                </button>
                <div
                    className={`${sidebarOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300 flex flex-col h-full`}
                >
                    <button
                        onClick={handleAddQuestion}
                        className="bg-[#ec4e39] text-[#262622] font-bold p-3 w-full rounded-lg mb-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <FiPlus className="mr-2" /> Add New Question
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-[#ec4e39]">
                        Your Questions
                    </h2>
                    <div className="space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                        {questions.map((q) => (
                            <div
                                key={q._id}
                                onClick={() => setActiveQuestion(q)}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${activeQuestion?._id === q._id
                                    ? "bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-white shadow-md"
                                    : "bg-[#3C3B38] hover:bg-[#4C4B48]"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium truncate max-w-[80%]">
                                        {q.content.length > 30
                                            ? q.content.substring(0, 30) + "..."
                                            : q.content || "New Question"}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            setQueIdToDelete(q._id);
                                            setShowDeleteQueConfirm(true);
                                        }}
                                        className={`transition-colors duration-200 ml-2 ${activeQuestion?._id === q._id
                                            ? "text-white hover:text-[#262622]"
                                            : "text-[#ec4e39] hover:text-[#d43d2a]"
                                            }`}
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <h1 className="text-4xl font-bold p-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ec4e39] to-[#afa18f]">
                    Dashboard
                </h1>
                {!activeQuestion && (
                    <section className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                        {/* Input Bar for Adding Questions */}
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                            <input
                                type="text"
                                value={questionInput}
                                onChange={(e) => setQuestionInput(e.target.value)}
                                className="flex-1 p-3 rounded-lg bg-[#3C3B38] text-[#f0f0f0] border border-[#4C4B48] focus:outline-none focus:border-[#ec4e39] transition-colors duration-200"
                                placeholder={
                                    activeQuestion
                                        ? activeQuestion.content
                                        : "Enter your Question"
                                }
                            />
                            <button
                                onClick={handleSaveQuestion}
                                className="w-full md:w-auto bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Save Question
                            </button>
                        </div>

                    </section>
                )}
                {activeQuestion && (
                    <section className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                        {/* Input Bar for Adding Questions */}
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                            <input
                                type="text"
                                value={questionInput}
                                onChange={(e) => setQuestionInput(e.target.value)}
                                className="flex-1 p-3 rounded-lg bg-[#3C3B38] text-[#f0f0f0] border border-[#4C4B48] focus:outline-none focus:border-[#ec4e39] transition-colors duration-200"
                                placeholder={
                                    activeQuestion
                                        ? activeQuestion.content
                                        : "Enter your Question"
                                }
                                readOnly
                            />
                            <button
                                className="w-full md:w-auto bg-[#3C3B38] text-[#f0f0f0] px-6 py-3 rounded-lg hover:bg-[#4C4B48] transition-colors duration-200 flex items-center justify-center"
                                onClick={generateLink}
                            >
                                <FiLink className="mr-2" /> Generate Link
                            </button>

                        </div>

                        {/* Toggle Accept Messages and Delete All Button */}
                        <div className="flex flex-wrap items-center justify-between space-y-4 md:space-y-0 mb-8">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-xl lg:text-2xl font-semibold">
                                    Accept Feedback
                                </h2>
                                <Switch
                                    onChange={handleSwitchChange}
                                    checked={
                                        activeQuestion
                                            ? activeQuestion.isAcceptingMessages
                                            : true
                                    }
                                    onColor="#ec4e39"
                                    offColor="#3C3B38"
                                    onHandleColor="#ffffff"
                                    offHandleColor="#afa18f"
                                    handleDiameter={24}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(236, 78, 57, 0.2)"
                                    height={32}
                                    width={56}
                                    className="react-switch"
                                    id="acceptMessages"
                                />
                            </div>
                            <div className="flex flex-wrap items-center space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                                <button
                                    className="bg-gradient-to-r from-[#d43d2a] to-[#ec4e39] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center w-full sm:w-auto"
                                    onClick={() => setShowDeleteAllConfirm(true)}
                                >
                                    <FiTrash2 className="mr-2" /> Delete All
                                    Messages
                                </button>
                                <button
                                    className="bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center w-full sm:w-auto"
                                    onClick={downloadMessages}
                                >
                                    <FiCopy className="mr-2" /> Export Messages
                                </button>
                                <button
                                    className="bg-[#3C3B38] text-[#f0f0f0] px-4 py-2 rounded-lg hover:bg-[#4C4B48] transition-colors duration-200 flex items-center w-full sm:w-auto"
                                    onClick={refreshMessages}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                    ) : (
                                        <FiRefreshCw className="mr-2" />
                                    )}
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Display Messages */}
                        <div className="flex-1">
                            {messages.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {messages.map((message) => (
                                        <MessageCard
                                            key={message._id}
                                            questionId={
                                                activeQuestion
                                                    ? activeQuestion._id
                                                    : ""
                                            }
                                            message={message}
                                            onDelete={handleDeleteMessage}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[#afa18f] text-center text-lg">
                                    No messages yet.
                                </p>
                            )}
                        </div>
                    </section>
                )}

            </main>

            {/* Modals */}
            {showLinkConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#2C2B28] p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-[#afa18f] text-2xl font-semibold mb-6">
                            Generated Link
                        </h3>
                        <div className="mb-6">
                            <input
                                type="text"
                                value={
                                    activeQuestion
                                        ? `${window.location.protocol}//${window.location.host}/profile/${activeQuestion._id}`
                                        : "Save the question to Generate URL"
                                }
                                readOnly
                                className="bg-[#3C3B38] text-[#afa18f] px-4 py-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4e39]"
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={copyToClipboard}
                                className="bg-[#ec4e39] hover:bg-[#d43d2a] text-[#262622] px-6 py-3 rounded-lg transition-colors duration-200 w-full font-semibold"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowLinkConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-6 py-3 rounded-lg hover:bg-[#4C4B48] transition-colors duration-200 w-full font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#2C2B28] p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-[#ec4e39] text-2xl font-bold mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="text-[#afa18f] mb-6 text-lg">
                            Are you sure you want to delete all messages? This
                            action cannot be undone.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={deleteAllMessagesAndRefresh}
                                className="bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-white px-6 py-3 rounded-lg transition-all duration-200 font-bold text-lg hover:shadow-lg"
                            >
                                Delete All Messages
                            </button>
                            <button
                                onClick={() => setShowDeleteAllConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-6 py-3 rounded-lg hover:bg-[#4C4B48] transition-colors duration-200 font-bold text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteQueConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#2C2B28] p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-[#ec4e39] text-2xl font-bold mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="text-[#afa18f] mb-6 text-lg">
                            Are you sure you want to delete this Question? This
                            action will delete all the feedbacks of this
                            Question and cannot be undone.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handelDeleteQuestion}
                                className="bg-[#d43d2a] hover:bg-[#ec4e39] text-[#262622] px-6 py-3 rounded-lg transition-colors duration-200 font-bold text-lg"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteQueConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-6 py-3 rounded-lg hover:bg-[#4C4B48] transition-colors duration-200 font-bold text-lg"
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
