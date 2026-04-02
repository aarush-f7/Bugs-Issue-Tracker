// routes/activityLog.js — Activity Log Routes
// Base path mounted in bugs.js: /api/bugs/:bugId/activity
// mergeParams: true ensures we can access the :bugId from the parent router.

const express = require("express");
const router = express.Router({ mergeParams: true });

const { getActivityLog } = require("../controllers/activityLogController");

const protect = require("../middlewares/protect");

// All activity log routes require authentication
router.use(protect);

// ──────────────────────────────────────────────
// @route  GET /api/bugs/:bugId/activity
// @desc   List activity logs for a bug
// @access Private (All logged-in)
// ──────────────────────────────────────────────
router.get("/", getActivityLog);

module.exports = router;
