const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/*
 @route   POST /api/auth/signup
 @desc    Register new user
 @access  Public
*/
router.post("/signup", async (req, res) => {
  try {
    console.log("Signup Body:", req.body);

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Validate role
    const validRole =
      role === "Admin" || role === "Member" ? role : "Member";

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: validRole,
    });

    // Response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("SIGNUP ERROR FULL:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
});

/*
 @route   POST /api/auth/login
 @desc    Login user
 @access  Public
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // Match password
    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });

  } catch (error) {
    console.error("LOGIN ERROR FULL:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
});

/*
 @route   GET /api/auth/users
 @desc    Get all users (Admin only)
 @access  Private/Admin
*/
router.get("/users", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("FETCH USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;