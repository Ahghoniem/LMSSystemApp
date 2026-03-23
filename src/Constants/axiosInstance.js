import axios from "axios";
import { API_BASE_URL } from ".";
import { deleteToken, getToken } from "../Utils";



const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 409) {
      console.warn("Unauthorized — maybe token expired.");
      deleteToken();
      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");
      window.location.href = "/login?msg=session_expired"; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
