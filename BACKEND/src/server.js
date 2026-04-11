// server.js — Entry Point of the Application
// This file:
//   1. Loads environment variables from .env
//   2. Creates the Express app
//   3. Connects to MongoDB
//   4. Registers all route files
//   5. Starts the server on the configured port

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");

// ─────────────────────────────────────────────
// Load environment variables from .env file
// Must be done BEFORE anything else that needs them
// ─────────────────────────────────────────────
dotenv.config({ path: path.join(__dirname, "../.env") });

// ─────────────────────────────────────────────
// Connect to MongoDB
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// Create the Express application instance
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// Global Middlewares
// These run on EVERY incoming request
// ─────────────────────────────────────────────

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Parse URL-encoded form data (e.g. from HTML forms)
app.use(express.urlencoded({ extended: false }));

// ─────────────────────────────────────────────
// Routes
// Each route file handles a specific resource
// ─────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/sprints", require("./routes/sprints"));
app.use("/api/bugs", require("./routes/bugs"));
app.use("/api/dashboard", require("./routes/dashboard"));
// Note: Comments and Activity Log routes are nested under /api/bugs
// and are registered inside routes/bugs.js using express.Router()

// ─────────────────────────────────────────────
// Root health-check endpoint
// Useful to verify the server is running
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🐛 Bug & Issue Tracker API is running!" });
});

// ─────────────────────────────────────────────
// 404 Handler — catches any unknown routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─────────────────────────────────────────────
// Global Error Handler
// Catches errors passed via next(error) in controllers
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ─────────────────────────────────────────────
// Start the Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

