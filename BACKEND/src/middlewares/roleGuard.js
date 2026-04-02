// middlewares/roleGuard.js — Role-Based Access Control Middleware
// This middleware restricts routes to specific user roles.
// It must be used AFTER the protect middleware (which sets req.user).
//
// Usage in a route file:
//   router.post("/", protect, roleGuard("Manager"), createProject);
//   router.patch("/status", protect, roleGuard("Developer"), updateStatus);
//   router.patch("/assign", protect, roleGuard("Manager", "Tester"), assignBug);

const roleGuard = (...allowedRoles) => {
  // We return a middleware function that has access to allowedRoles
  // via closure (JavaScript's scoping mechanism)
  return (req, res, next) => {
    // req.user is set by the protect middleware before this runs
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized." });
    }

    // Check if the logged-in user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        // 403 Forbidden — user is authenticated but not permitted
        message: `Access denied. Only ${allowedRoles.join(" or ")} can perform this action.`,
      });
    }

    // Role is valid — pass control to the next handler
    next();
  };
};

module.exports = roleGuard;
