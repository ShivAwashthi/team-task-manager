const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 @route   POST /api/tasks
 @desc    Create a new task
 @access  Admin only
*/
router.post("/", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!title || !description || !projectId || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check project exists
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

  // Ensure assigned user is part of project team
if (
  !project.teamMembers.some(
    (member) => member.toString() === assignedTo.toString()
  )
) {
  return res.status(400).json({
    success: false,
    message: "Assigned user is not part of this project",
  });
}

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      assignedBy: req.user._id,
      status: status || "Pending",
      priority: priority || "Medium",
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
} catch (error) {
  console.error("TASK CREATE ERROR FULL:", error);

  res.status(500).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    errors: error.errors || null,
  });
}
});

/*
 @route   GET /api/tasks
 @desc    Get all tasks (Admin) or assigned tasks (Member)
 @access  Private
*/
router.get("/", protect, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "Admin") {
      tasks = await Task.find()
        .populate("projectId", "title")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email");
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("projectId", "title")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email");
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
 @route   GET /api/tasks/:id
 @desc    Get single task
 @access  Private
*/
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("projectId", "title description")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Member can only view own task
    if (
      req.user.role !== "Admin" &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
 @route   PUT /api/tasks/:id
 @desc    Update task
 @access  Admin or assigned member
*/
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Member can only update own task status
    if (
      req.user.role !== "Admin" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (req.user.role === "Member") {
      // Members only allowed to update status
      task.status = req.body.status || task.status;
    } else {
      // Admin full update
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.assignedTo = req.body.assignedTo || task.assignedTo;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
 @route   DELETE /api/tasks/:id
 @desc    Delete task
 @access  Admin only
*/
router.delete("/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
 @route   GET /api/tasks/dashboard/stats
 @desc    Dashboard statistics
 @access  Private
*/
router.get("/dashboard/stats", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "Member") {
      query.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(query);
    const pendingTasks = await Task.countDocuments({
      ...query,
      status: "Pending",
    });
    const inProgressTasks = await Task.countDocuments({
      ...query,
      status: "In Progress",
    });
    const completedTasks = await Task.countDocuments({
      ...query,
      status: "Completed",
    });

    const overdueTasks = await Task.countDocuments({
      ...query,
      dueDate: { $lt: new Date() },
      status: { $ne: "Completed" },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;