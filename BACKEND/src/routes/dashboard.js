// routes/dashboard.js — Dashboard & Stats Routes
// Base path: /api/dashboard

const express = require("express");
const router = express.Router();

const {
  getOverallStats,
  getProjectStats,
} = require("../controllers/dashboardController");

const protect = require("../middlewares/protect");

// All dashboard routes require authentication
router.use(protect);

// ──────────────────────────────────────────────
// @route  GET /api/dashboard/stats
// @desc   Overall bug statistics
// @access Private (All logged-in)
// ──────────────────────────────────────────────
router.get("/stats", getOverallStats);

// ──────────────────────────────────────────────
// @route  GET /api/dashboard/project/:projectId
// @desc   Project-specific bug statistics
// @access Private (All logged-in)
// ──────────────────────────────────────────────
router.get("/project/:projectId", getProjectStats);

module.exports = router;

