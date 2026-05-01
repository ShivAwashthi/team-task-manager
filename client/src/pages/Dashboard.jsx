// client/src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/tasks/dashboard/stats");
      setStats(res.data.stats);
    } catch (error) {
      console.error("Dashboard fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded px-3 mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">Team Task Manager</span>

          <div className="d-flex align-items-center gap-3 text-white">
            <span>
              Welcome, <strong>{user?.name}</strong> ({user?.role})
            </span>

            <Link to="/projects" className="btn btn-outline-light btn-sm">
              Projects
            </Link>

            <Link to="/tasks" className="btn btn-outline-light btn-sm">
              Tasks
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Heading */}
      <div className="mb-4">
        <h2 className="mb-4 text-dark text-center fw-bold">Dashboard</h2>
        <p className="text-muted">
          Track your tasks, progress, and overdue items
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow border-0">
                <div className="card-body">
                  <h5>Total Tasks</h5>
                 <h2 className="fw-bold text-dark display-6">
  {stats.totalTasks}
</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow border-0">
                <div className="card-body">
                  <h5>Pending Tasks</h5>
                  <h2 className="fw-bold text-dark display-6">
  {stats.pendingTasks}
</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow border-0">
                <div className="card-body">
                  <h5>In Progress</h5>
                 <h2 className="fw-bold text-dark display-6">
  {stats.inProgressTasks}
</h2>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow border-0">
                <div className="card-body">
                  <h5>Completed Tasks</h5>
                 <h2 className="fw-bold text-dark display-6">
  {stats.completedTasks}
</h2>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow border-0">
                <div className="card-body">
                  <h5>Overdue Tasks</h5>
                  <h2 className="fw-bold text-danger display-6">
  {stats.overdueTasks}
</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-5">
            <h4>Quick Actions</h4>

            <div className="d-flex gap-3 mt-3">
              {user?.role === "Admin" && (
                <Link to="/projects" className="btn btn-primary">
                  Manage Projects
                </Link>
              )}

              <Link to="/tasks" className="btn btn-success">
                View Tasks
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;