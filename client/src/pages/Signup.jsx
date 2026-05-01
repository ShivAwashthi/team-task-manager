// client/src/pages/Signup.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const result = await signup(formData);

    if (result.success) {
      setMessage("Signup successful!");
      navigate("/dashboard");
    } else {
      setMessage(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "500px" }}
      >
        <h2 className="text-center mb-4">Create Account</h2>

        {message && (
          <div
            className={`alert ${
              message.includes("successful")
                ? "alert-success"
                : "alert-danger"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;