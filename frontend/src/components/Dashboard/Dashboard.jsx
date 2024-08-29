import { useContext, useEffect, useState, useCallback } from "react";
import UserContext from "../../contexts/userContext";
import { toast } from "react-hot-toast";
import axiosInstance from "../../axiosInstance";
import Switch from "react-switch";
import MessageCard from "../MessageCard";
import { FiRefreshCw, FiCopy } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function Dashboard() {
  const { user } = useContext(UserContext);
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/profile/${user.username}`;
  const [acceptMessages, setAcceptMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessageAcceptanceStatus = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/dashboard/message-acceptance");
      setAcceptMessages(response.data.data.isAcceptingMessages);
    } catch (error) {
      console.error("Error fetching message acceptance status:", error);
      toast.error("Failed to fetch message acceptance status");
    }
  }, []);

  const fetchMessages = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axiosInstance.get("/dashboard/messages");
      setMessages(response.data.data.messages);
      if (showLoading) toast.success("Messages refreshed successfully");
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessageAcceptanceStatus();
    fetchMessages();
  }, [fetchMessageAcceptanceStatus, fetchMessages]);

  const handleSwitchChange = async (checked) => {
    try {
      await axiosInstance.put("/dashboard/message-acceptance", {
        acceptMessages: checked,
      });
      setAcceptMessages(checked);
      toast.success("Message acceptance status updated successfully");
    } catch (error) {
      console.error("Error updating message acceptance status:", error);
      toast.error("Failed to update message acceptance status");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied to clipboard");
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col lg:flex-row">
      <aside className="w-full lg:w-1/4 p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-700">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">
          Your Unique Profile Link
        </h2>
        <div className="flex items-center justify-between bg-gray-700 rounded-md overflow-hidden mb-6 lg:mb-8">
          <input
            type="text"
            value={profileUrl}
            readOnly
            className="w-full p-2 lg:p-3 bg-transparent text-white text-sm lg:text-base"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white p-2 lg:p-3 hover:bg-blue-600 transition-colors duration-200"
          >
            <FiCopy className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-semibold">Accept Messages</h2>
          <Switch
            onChange={handleSwitchChange}
            checked={acceptMessages}
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
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold p-4 lg:p-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Dashboard
        </h1>
        <section className="flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 lg:px-8">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 sm:mb-0">
              Messages Received: {messages.length}
            </h2>
            <button
              className="bg-blue-500 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors duration-200"
              onClick={() => fetchMessages(true)}
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
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-4">
            {messages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {messages.map((message) => (
                  <MessageCard
                    key={message._id}
                    message={message}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">No messages yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
