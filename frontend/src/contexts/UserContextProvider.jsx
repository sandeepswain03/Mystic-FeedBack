/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "./userContext.js";
import { axiosInstance } from "../axiosInstance.js";
import { setupAxiosInterceptors } from "../axiosInstance.js";

export default function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/user/current-user");
      setUser(response.data.data.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const logoutCallback = () => {
    setUser(null); // Clear user context
    navigate("/login"); // Navigate to login page
  };

  setupAxiosInterceptors(logoutCallback);
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
