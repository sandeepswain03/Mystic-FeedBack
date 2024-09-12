import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import toast from "react-hot-toast";
import { FiSend, FiUser } from "react-icons/fi";


function SendMessage() {
  const { questionId } = useParams();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [question, setQuestion] = useState("");
  const [userName, setUserName] = useState("");
  const [acceptanceStatus, setAcceptanceStatus] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (acceptanceStatus) {
        await axiosInstance.post("/feedback/send-message", {
          questionId,
          content: message,
        });
        toast.success("Message sent successfully");
        setMessage("");
        setIsMessageSent(true)
      } else {
        toast.error("User not Accepting Messages")
      }
    } catch (error) {
      console.log("Error Sending Message", error);

    } finally {
      setIsLoading(false);
    }
  };

  const getQuestionAndUsername = async () => {
    try {
      const question = await axiosInstance.get("/feedback/getQuestion", {
        params: {
          queId: questionId
        }
      });
      if (question) {
        setQuestion(question.data.data.content);
        setAcceptanceStatus(question.data.data.
          isAcceptingMessages);
      }
      try {
        const username = await axiosInstance.get("/feedback/getUserName", {
          params: {
            Id: question.data.data.owner
          }
        });
        setUserName(username.data.data)

      } catch (error) {
        console.log("Error Fetching username:", error);

      }

    } catch (error) {
      console.error("Error fetching question:", error);
    }
  }
  useEffect(() => {
    getQuestionAndUsername();

  }, []);


  if (!isMessageSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg border border-gray-700">
          <div className="text-center">
            <div className="inline-block p-3 rounded-full bg-blue-600 mb-4">
              <FiUser className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Send a Message
            </h1>
            <p className="text-xl text-white">
              to <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">{userName}</span>
            </p>
          </div>


          <div className="flex items-center justify-between bg-gray-700 rounded-md overflow-hidden mb-6 lg:mb-8">
            <input
              type="text"
              value={question}
              readOnly
              className="w-full p-2 lg:p-3 bg-transparent text-white text-sm lg:text-base"
            />

          </div>


          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm">
              <textarea
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                disabled={isLoading}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FiSend
                    className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center p-10 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-extrabold text-white mb-2">Thank You for your valuable Feedback</h1>
      </div>
    </div>
  );
}

export default SendMessage;
