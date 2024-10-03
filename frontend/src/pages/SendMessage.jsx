import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { axiosInstance } from "../axiosInstance";
import toast from "react-hot-toast";
import { FiSend, FiUser, FiMessageSquare } from "react-icons/fi";
import UserContext from "../contexts/userContext.js";
import useMousePosition from "../utils/useMousePostion.js";
import mask from "../../public/mask.svg";
import { motion } from "framer-motion";

function SendMessage() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const { questionId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isMessageSent, setIsMessageSent] = useState(false);
    const [question, setQuestion] = useState("");
    const [userName, setUserName] = useState("");
    const [acceptanceStatus, setAcceptanceStatus] = useState(true);
    const navigate = useNavigate();
    const { x, y } = useMousePosition();
    const size = 40;

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (acceptanceStatus) {
                await axiosInstance.post("/feedback/send-message", {
                    questionId,
                    content: data.message
                });
                toast.success("Message sent successfully");
                setIsMessageSent(true);
            } else {
                toast.error("User is not accepting messages");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getQuestionAndUsername = async () => {
        try {
            const questionResponse = await axiosInstance.get(
                "/feedback/getQuestion",
                {
                    params: { queId: questionId }
                }
            );
            if (questionResponse.data.data) {
                setQuestion(questionResponse.data.data.content);
                setAcceptanceStatus(
                    questionResponse.data.data.isAcceptingMessages
                );

                const usernameResponse = await axiosInstance.get(
                    "/feedback/getUserName",
                    {
                        params: { Id: questionResponse.data.data.owner }
                    }
                );
                setUserName(usernameResponse.data.data);
            }
        } catch (error) {
            console.error("Error fetching question and username:", error);
            toast.error("Failed to load question details");
        }
    };

    useEffect(() => {
        getQuestionAndUsername();
    }, [questionId]);

    if (isMessageSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#2C2B28] px-4 sm:px-6 lg:px-8">
                <div className="text-center p-10 bg-[#262622] rounded-xl shadow-2xl border border-[#393937]">
                    <FiMessageSquare className="mx-auto h-16 w-16 text-[#ec4e39] mb-4" />
                    <h1 className="text-3xl font-extrabold text-[#ec4e39] mb-4">
                        Thank You for Your Valuable Feedback
                    </h1>
                    <p className="text-[#afa18f] text-lg">
                        Your message has been sent successfully.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#2C2B28] px-4 sm:px-6 lg:px-8 relative">
            <motion.div
                className="absolute inset-0 bg-[#ec4e39] z-0 hidden md:block"
                animate={{
                    WebkitMaskPosition: `${x - size / 2}px ${y - size / 2}px`,
                    WebkitMaskSize: `${size}px`
                }}
                transition={{
                    type: "tween",
                    ease: "backOut",
                    duration: 0.5
                }}
                style={{
                    WebkitMaskImage: `url(${mask})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskSize: `${size}px`
                }}
            />
            <div className="max-w-lg w-full space-y-8 bg-[#262622] p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border border-[#393937] relative z-10">
                <div className="text-center">
                    <div className="inline-block p-3 rounded-full bg-[#ec4e39] mb-4">
                        <FiUser className="h-8 w-8 text-[#262622]" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#ec4e39] mb-2">
                        Send a Message
                    </h1>
                    <p className="text-xl text-[#afa18f]">
                        to{" "}
                        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ec4e39] to-[#d43d2a]">
                            {userName}
                        </span>
                    </p>
                </div>

                <div className="bg-[#2C2B28] rounded-md overflow-hidden mb-6 lg:mb-8">
                    <input
                        type="text"
                        value={question}
                        readOnly
                        className="w-full p-3 bg-transparent text-[#f0f0f0] text-sm lg:text-base border-none focus:ring-0"
                    />
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8 space-y-6"
                >
                    <div className="rounded-md shadow-sm">
                        <textarea
                            {...register("message", {
                                required: "Message is required",
                                minLength: {
                                    value: 10,
                                    message:
                                        "Message must be at least 10 characters"
                                }
                            })}
                            className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:px-4 sm:py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 text-sm sm:text-base transition duration-300"
                            rows="6"
                            placeholder="Type your message here..."
                        />
                        {errors.message && (
                            <p className="mt-2 text-xs sm:text-sm text-[#ec4e39]">
                                {errors.message.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 sm:py-3 sm:px-6 border border-transparent text-sm sm:text-base font-bold rounded-full text-[#262622] bg-[#ec4e39] hover:bg-[#d43d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ec4e39] transition duration-300 ease-in-out transform hover:scale-105"
                            disabled={isLoading}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <FiSend
                                    className="h-5 w-5 text-[#262622] group-hover:text-[#1C1B18]"
                                    aria-hidden="true"
                                />
                            </span>
                            {isLoading ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SendMessage;
