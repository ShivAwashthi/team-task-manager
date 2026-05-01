// client/src/api/api.js

import axios from "axios";

// Base API URL
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Attach token automatically)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handle unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on token expiry
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;