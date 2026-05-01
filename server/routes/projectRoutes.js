const express = require("express");
const Project = require("../models/Project");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 @route   POST /api/projects
 @desc    Create a new project
 @access  Admin only
*/
router.post("/", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    console.log("PROJECT CREATE BODY:", req.body);
    console.log("REQ USER:", req.user);

    const { title, description, teamMembers, dueDate } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      teamMembers: teamMembers || [],
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    console.error("PROJECT CREATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
});

/*
 @route   GET /api/projects
 @desc    Get all projects (Admin) or member projects
 @access  Private
*/
router.get("/", protect, async (req, res) => {
  try {
    let projects;

    if (req.user.role === "Admin") {
      projects = await Project.find()
        .populate("createdBy", "name email role")
        .populate("teamMembers", "name email role");
    } else {
      projects = await Project.find({
        teamMembers: req.user._id,
      })
        .populate("createdBy", "name email role")
        .populate("teamMembers", "name email role");
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });

  } catch (error) {
    console.error("FETCH PROJECTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
 @route   GET /api/projects/:id
 @desc    Get single project by ID
 @access  Private
*/
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("teamMembers", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Member can only access assigned projects
    if (
      req.user.role !== "Admin" &&
      !project.teamMembers.some(
        (member) => member._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });

  } catch (error) {
    console.error("GET PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
 @route   PUT /api/projects/:id
 @desc    Update project
 @access  Admin only
*/
router.put("/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { title, description, teamMembers, status, dueDate } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title: title || project.title,
        description: description || project.description,
        teamMembers:
          teamMembers !== undefined ? teamMembers : project.teamMembers,
        status: status || project.status,
        dueDate: dueDate || project.dueDate,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("createdBy", "name email role")
      .populate("teamMembers", "name email role");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });

  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
});

/*
 @route   DELETE /api/projects/:id
 @desc    Delete project
 @access  Admin only
*/
router.delete("/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });

  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;