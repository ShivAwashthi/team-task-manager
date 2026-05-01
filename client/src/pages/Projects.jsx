import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    teamMembers: [],
  });

  // Fetch all users (Admin only)
  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
     console.log("Users API Response:", res.data.users);
setUsers(res.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to fetch projects"
      );
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  fetchProjects();

  if (user?.role === "Admin") {
    fetchUsers();
  }
}, [user]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle normal input fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle team member multi-select
  const handleTeamMembersChange = (e) => {
    const selectedMembers = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData({
      ...formData,
      teamMembers: selectedMembers,
    });
  };

  // Create project
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/projects", formData);

      setMessage(res.data.message);

      setFormData({
        title: "",
        description: "",
        dueDate: "",
        teamMembers: [],
      });

      fetchProjects();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Project creation failed"
      );
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  return (
    <div className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded px-3 mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">Projects</span>

          <div className="d-flex gap-2">
            <Link to="/dashboard" className="btn btn-outline-light btn-sm">
              Dashboard
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

      <h2 className="mb-4 text-dark text-center fw-bold">Project Management</h2>

      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("success")
              ? "alert-success"
              : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

      {/* Admin Create Form */}
      {user?.role === "Admin" && (
        <div className="card shadow p-4 mb-5">
          <h4>Create New Project</h4>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Project Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Team Members */}
           
<div className="mb-3">
  <label className="form-label">Assign Team Members</label>
  <select
    multiple
    className="form-select"
    value={formData.teamMembers}
    onChange={handleTeamMembersChange}
  >
    {users.map((member) => (
      <option key={member._id} value={member._id}>
        {member.name} ({member.email}) - {member.role}
      </option>
    ))}
  </select>

  <small className="text-muted">
    Hold Ctrl (Windows) or Cmd (Mac) to select multiple members
  </small>
</div>

            {/* Due Date */}
            <div className="mb-3">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </form>
        </div>
      )}

      {/* Project List */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
       <div className="row g-4">
  {projects.length > 0 ? (
    projects.map((project) => (
      <div className="col-md-6 col-lg-4" key={project._id}>
        <div className="card shadow h-100">
          <div className="card-body">
            <h5>{project.title}</h5>

            <p>{project.description}</p>

            <p>
              <strong>Status:</strong> {project.status || "Pending"}
            </p>

            <p>
              <strong>Due:</strong>{" "}
              {project.dueDate
                ? new Date(project.dueDate).toLocaleDateString()
                : "N/A"}
            </p>

            {/* Team Members List */}
            <p>
              <strong>Team Members:</strong>
            </p>

            {project.teamMembers && project.teamMembers.length > 0 ? (
              <ul className="list-unstyled mb-3">
                {project.teamMembers.map((member) => (
                  <li key={member._id}>
                    • {member.name} ({member.email}) - {member.role}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No team members assigned</p>
            )}

            {user?.role === "Admin" && (
              <button
                onClick={() => handleDelete(project._id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
    <p>No projects found.</p>
  )}
</div>
      )}
    </div>
  );
}

export default Projects;