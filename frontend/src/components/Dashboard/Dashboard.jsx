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
    FiLink,
    FiX
} from "react-icons/fi";
import {
    FaEnvelope,
    FaCommentDots,
    FaFlag,
    FaExclamationTriangle
} from "react-icons/fa";
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
                className={`${
                    sidebarOpen ? "w-full sm:w-64" : "w-12"
                } transition-all duration-300 ease-in-out bg-[#2C2B28] p-2 flex flex-col shadow-lg h-screen overflow-hidden`}
            >
                <button
                    onClick={toggleSidebar}
                    className="mb-8 text-[#ec4e39] hover:text-[#d43d2a] transition-colors duration-200 self-end"
                >
                    {sidebarOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                </button>
                <div
                    className={`${sidebarOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300 flex flex-col h-full overflow-hidden`}
                >
                    <button
                        onClick={() => {
                            handleAddQuestion();
                            setSidebarOpen(false);
                        }}
                        className="bg-[#ec4e39] text-[#262622] font-bold p-3 w-full rounded-full mb-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                    >
                        <FiPlus className="mr-2" /> Add New Question
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-[#ec4e39] flex-shrink-0">
                        Your Questions
                    </h2>
                    <div className="space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                        {questions.map((q) => (
                            <div
                                key={q._id}
                                onClick={() => {
                                    setActiveQuestion(q);
                                    setSidebarOpen(false);
                                }}
                                className={`p-3 rounded-full cursor-pointer transition-all duration-200 ${
                                    activeQuestion?._id === q._id
                                        ? "bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-[#262622] shadow-md hover:shadow-lg"
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
                                            e.stopPropagation();
                                            setQueIdToDelete(q._id);
                                            setShowDeleteQueConfirm(true);
                                        }}
                                        className={`transition-colors duration-200 ml-2 ${
                                            activeQuestion?._id === q._id
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
                {!activeQuestion && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-[#ec4e39] rounded-full flex items-center justify-center">
                                    <FaEnvelope className="text-[#262622] text-3xl" />
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-4">
                                <div className="border border-[#3C3B38] rounded-lg p-4 w-full sm:w-48 h-28 flex flex-col justify-between bg-transparent">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-[#ec4e39] rounded-full flex items-center justify-center mr-2">
                                            <FaCommentDots className="text-[#262622] text-xl" />
                                        </div>
                                        <p className="text-center break-words flex-1">
                                            What&apos;s been on your mind
                                            lately?
                                        </p>
                                    </div>
                                </div>
                                <div className="border border-[#3C3B38] rounded-lg p-4 w-full sm:w-48 h-28 flex flex-col justify-between bg-transparent">
                                    <div className="flex items-center ">
                                        <div className="w-10 h-10 bg-[#ec4e39] rounded-full flex items-center justify-center mr-2">
                                            <FaFlag className="text-[#262622] text-xl" />
                                        </div>
                                        <p className="text-center break-words flex-1">
                                            What do you want to achieve?
                                        </p>
                                    </div>
                                </div>
                                <div className="border border-[#3C3B38] rounded-lg p-4 w-full sm:w-48 h-28 flex flex-col justify-between bg-transparent">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-[#ec4e39] rounded-full flex items-center justify-center mr-2">
                                            <FaExclamationTriangle className="text-[#262622] text-xl" />
                                        </div>
                                        <p className="text-center break-words flex-1">
                                            What&apos;s holding you back?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 w-full max-w-xl mt-auto mb-16">
                            <div className="flex items-center bg-[#3C3B38] rounded-full p-4 relative">
                                <input
                                    type="text"
                                    value={questionInput}
                                    onChange={(e) =>
                                        setQuestionInput(e.target.value)
                                    }
                                    className="flex-grow bg-transparent outline-none text-[#f0f0f0] pr-24 "
                                    placeholder={
                                        activeQuestion
                                            ? activeQuestion.content
                                            : "Enter your Question"
                                    }
                                />
                                <button
                                    onClick={handleSaveQuestion}
                                    className="bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-[#262622] px-2 sm:px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 absolute right-2 font-semibold"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeQuestion && (
                    <section className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                        {/* Input Bar for Adding Questions */}
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                            <input
                                type="text"
                                value={questionInput}
                                onChange={(e) =>
                                    setQuestionInput(e.target.value)
                                }
                                className="flex-1 p-3 rounded-full bg-[#3C3B38] text-[#f0f0f0] border border-[#4C4B48] focus:outline-none focus:border-[#ec4e39] transition-colors duration-200"
                                placeholder={
                                    activeQuestion
                                        ? activeQuestion.content
                                        : "Enter your Question"
                                }
                                readOnly
                            />
                            <button
                                className="w-full md:w-auto bg-[#3C3B38] text-[#f0f0f0] px-6 py-3 rounded-full hover:bg-[#4C4B48] transition-colors duration-200 flex items-center justify-center hover:shadow-lg"
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
                                    className="bg-gradient-to-r from-[#d43d2a] to-[#ec4e39] text-[#262622] px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center w-full sm:w-auto hover:brightness-110"
                                    onClick={() =>
                                        setShowDeleteAllConfirm(true)
                                    }
                                >
                                    <FiTrash2 className="mr-2" /> Delete All
                                    Messages
                                </button>
                                <button
                                    className="bg-gradient-to-r from-[#ec4e39] to-[#d43d2a] text-[#262622]  px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center w-full sm:w-auto hover:brightness-110"
                                    onClick={downloadMessages}
                                >
                                    <FiCopy className="mr-2" /> Export Messages
                                </button>
                                <button
                                    className="bg-[#3C3B38] text-[#f0f0f0] px-4 py-2 rounded-full hover:bg-[#4C4B48] transition-colors duration-200 flex items-center w-full sm:w-auto hover:shadow-md"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2C2B28] p-6 rounded-xl shadow-xl w-full max-w-sm">
                        <h3 className="text-[#afa18f] text-xl font-semibold mb-4">
                            Generated Link
                        </h3>
                        <div className="mb-4">
                            <div className="bg-[#3C3B38] text-[#afa18f] px-3 py-2 rounded-lg overflow-hidden overflow-ellipsis whitespace-nowrap">
                                {activeQuestion
                                    ? `${window.location.protocol}//${window.location.host}/profile/${activeQuestion._id}`
                                    : "Save the question to Generate URL"}
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={copyToClipboard}
                                className="bg-[#ec4e39] hover:bg-[#d43d2a] text-[#262622] px-4 py-2 rounded-full transition-colors duration-200 font-semibold text-sm"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowLinkConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-4 py-2 rounded-full hover:bg-[#4C4B48] transition-colors duration-200 font-semibold text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#2C2B28] p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-[#ec4e39] text-xl font-bold mb-2">
                            Delete All Messages?
                        </h3>
                        <p className="text-[#afa18f] mb-4 text-sm">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteAllConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-4 py-2 rounded-full hover:bg-[#4C4B48] transition-colors duration-200 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAllMessagesAndRefresh}
                                className="bg-[#ec4e39] text-[#262622] px-4 py-2 rounded-full hover:bg-[#d43d2a] transition-colors duration-200 font-semibold text-sm"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteQueConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#2C2B28] p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-[#ec4e39]">
                        <h3 className="text-[#ec4e39] text-2xl font-bold mb-4 flex items-center">
                            <FiTrash2 className="mr-2" /> Confirm Deletion
                        </h3>
                        <p className="text-[#afa18f] mb-6 text-lg leading-relaxed">
                            Are you sure you want to delete this question? This
                            action will:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Remove the question permanently</li>
                                <li>Delete all associated feedbacks</li>
                                <li>Cannot be undone</li>
                            </ul>
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteQueConfirm(false)}
                                className="bg-[#3C3B38] text-[#afa18f] px-6 py-3 rounded-full hover:bg-[#4C4B48] transition-all duration-200 font-bold text-lg flex items-center"
                            >
                                <FiX className="mr-2" /> Cancel
                            </button>
                            <button
                                onClick={handelDeleteQuestion}
                                className="bg-[#d43d2a] hover:bg-[#ec4e39] text-[#262622] px-6 py-3 rounded-full transition-all duration-200 font-bold text-lg flex items-center"
                            >
                                <FiTrash2 className="mr-2" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
