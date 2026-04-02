// routes/auth.js — Authentication Routes
// Base path: /api/auth  (registered in server.js)
//
// Public routes  → No token required
// Protected route → Requires valid JWT via protect middleware

const express = require("express");
const router = express.Router();

// Controller functions
const { register, login, getMe } = require("../controllers/authController");

// Middleware: verifies JWT and attaches req.user
const protect = require("../middlewares/protect");

// ──────────────────────────────────────────────
// @route  POST /api/auth/register
// @desc   Create a new user account
// @access Public
// ──────────────────────────────────────────────
router.post("/register", register);

// ──────────────────────────────────────────────
// @route  POST /api/auth/login
// @desc   Login and receive a JWT token
// @access Public
// ──────────────────────────────────────────────
router.post("/login", login);

// ──────────────────────────────────────────────
// @route  GET /api/auth/me
// @desc   Get the currently logged-in user's profile
// @access Private — must send JWT in Authorization header
// ──────────────────────────────────────────────
router.get("/me", protect, getMe);

module.exports = router;
