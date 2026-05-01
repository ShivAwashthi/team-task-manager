// server/middleware/roleMiddleware.js

// Role-based access control middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user exists from auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first.",
      });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not permitted.`,
      });
    }

    return next();
  };
};

module.exports = authorizeRoles;