// controllers/authController.js — Authentication Logic
// Handles: register, login, and getMe (profile fetch)
// All functions are async and wrapped in try/catch for error handling.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────
// Helper: Generate a JWT token for a given user ID
// The token expires based on JWT_EXPIRES_IN in .env (e.g. "7d")
// ─────────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },            // payload — data stored inside the token
    process.env.JWT_SECRET,    // secret key used to sign the token
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // --- Validate required fields ---
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide name, email, password, and role." });
    }

    // --- Check if a user with this email already exists ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // --- Create the new user ---
    // The password is automatically hashed by the pre-save hook in User.js
    const user = await User.create({ name, email, password, role });

    // --- Generate JWT for the new user ---
    const token = generateToken(user._id);

    // --- Send response (never send the password back) ---
    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors (e.g. invalid role enum)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login with email & password, receive JWT
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validate required fields ---
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // --- Find user by email ---
    // We use .select("+password") because password has select:false in schema —
    // this explicitly includes it for this one query only
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // --- Compare entered password with the stored hashed password ---
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // --- Generate JWT and return it ---
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the currently logged-in user's profile
// @access  Private (requires valid JWT via protect middleware)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    // No DB query needed — the user is already loaded
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { register, login, getMe };
