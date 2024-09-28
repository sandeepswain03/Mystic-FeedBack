import axios from "axios";
import { BASE_URL } from "./constants.js";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

const setupAxiosInterceptors = (logoutCallback) => {
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && error.response.status === 419) {
                console.error("Session expired. Logging out...");
                logoutCallback();
            }

            return Promise.reject(error);
        }
    );
};

export { axiosInstance, setupAxiosInterceptors };
