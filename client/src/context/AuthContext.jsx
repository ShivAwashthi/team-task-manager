// client/src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

// Create Context
const AuthContext = createContext();

// Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider
export const AuthProvider = ({ children }) => {
  // Load user from localStorage if exists
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [loading, setLoading] = useState(true);

  // Sync token to axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }

    setLoading(false);
  }, [token]);

  // Signup
  const signup = async (formData) => {
    try {
      const res = await api.post("/auth/signup", formData);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  // Login
  const login = async (formData) => {
    try {
      const res = await api.post("/auth/login", formData);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Invalid credentials.",
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  // Context values
  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};