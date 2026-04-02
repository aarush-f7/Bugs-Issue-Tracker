// middlewares/protect.js — JWT Authentication Middleware
// This middleware runs before any protected route handler.
// It checks that the request has a valid JWT token in the
// Authorization header, and if valid, attaches the user to req.user.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // ─────────────────────────────────────────────────────────────
  // Step 1: Check if Authorization header exists and starts with "Bearer"
  // The header looks like:  Authorization: Bearer <token>
  // ─────────────────────────────────────────────────────────────
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract the token by splitting "Bearer <token>" and taking index 1
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token found, deny access immediately
  if (!token) {
    return res.status(401).json({
      message: "Not authorized. No token provided.",
    });
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // Step 2: Verify the token using the same secret used to sign it
    // jwt.verify() throws an error if token is invalid or expired
    // If valid, it returns the decoded payload: { id, iat, exp }
    // ─────────────────────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─────────────────────────────────────────────────────────────
    // Step 3: Find the user in the DB using the id from the token
    // We exclude password from the query result (it has select:false)
    // ─────────────────────────────────────────────────────────────
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized. User not found.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Step 4: Pass control to the next middleware or route handler
    // req.user is now available in all subsequent handlers
    // ─────────────────────────────────────────────────────────────
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized. Token is invalid or expired.",
    });
  }
};

module.exports = protect;
