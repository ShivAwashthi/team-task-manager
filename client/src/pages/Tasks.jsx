// client/src/pages/Tasks.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Tasks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch tasks");
    }
  };

  // Fetch projects for admin task creation
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    if (user?.role === "Admin") {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, []);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/tasks", formData);

      setMessage(res.data.message);

      setFormData({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        priority: "Medium",
        dueDate: "",
      });

      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || "Task creation failed");
    }
  };

  // Update member status
  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || "Status update failed");
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded px-3 mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">Tasks</span>

          <div className="d-flex gap-2">
            <Link to="/dashboard" className="btn btn-outline-light btn-sm">
              Dashboard
            </Link>

            <Link to="/projects" className="btn btn-outline-light btn-sm">
              Projects
            </Link>

            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

<h2 className="mb-4 text-dark text-center fw-bold">
  Task Management
</h2>

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

      {/* Admin Task Form */}
      {user?.role === "Admin" && (
        <div className="card shadow p-4 mb-5">
          <h4>Create Task</h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Task Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Project</label>
              <select
                className="form-select"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

           <div className="mb-3">
  <label className="form-label">Assign To</label>
  <select
    className="form-select"
    name="assignedTo"
    value={formData.assignedTo}
    onChange={handleChange}
    required
    disabled={!formData.projectId}
  >
    <option value="">
      {formData.projectId ? "Select Team Member" : "Select Project First"}
    </option>

    {projects
      .find((project) => project._id === formData.projectId)
      ?.teamMembers?.map((member) => (
        <option key={member._id} value={member._id}>
          {member.name} ({member.email}) - {member.role}
        </option>
      ))}
  </select>
</div>

            <div className="mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row g-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div className="col-md-6 col-lg-4" key={task._id}>
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h5>{task.title}</h5>

                    <p>{task.description}</p>
                    <p>
                      <strong>Assigned To:</strong> {task.assignedTo?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Project:</strong> {task.projectId?.title}
                    </p>

                    <p>
                      <strong>Status:</strong> {task.status}
                    </p>

                    <p>
                      <strong>Priority:</strong> {task.priority}
                    </p>

                    <p>
                      <strong>Due:</strong>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>

                    {/* Member Status Update */}
                    {user?.role === "Member" && (
                      <select
                        className="form-select mb-2"
                        value={task.status}
                        onChange={(e) =>
                          updateTaskStatus(task._id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    )}

                    {/* Admin Delete */}
                    {user?.role === "Admin" && (
                      <button
                        onClick={() => deleteTask(task._id)}
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
            <p>No tasks found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Tasks;