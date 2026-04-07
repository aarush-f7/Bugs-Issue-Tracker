// routes/bugs.js — Bug & Issue Routes
// Base path: /api/bugs

const express = require("express");
const router = express.Router();

const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  updateBugStatus,
  assignBug,
  deleteBug,
  getAssignedToMe,
  getReportedByMe,
} = require("../controllers/bugController");


// Middlewares
const protect = require("../middlewares/protect");
const roleGuard = require("../middlewares/roleGuard");

// Sub-routers
const activityLogRouter = require("./activityLog");
const commentRouter = require("./comments");

// All routes require authentication
router.use(protect);


//Adding these two routes of new functions (getAssignedToMe, getReportedByMe) added today-------------
router.get("/assigned/me", roleGuard("Developer"), getAssignedToMe);
router.get("/reported/me", roleGuard("Tester"), getReportedByMe);

// ──────────────────────────────────────────────
// Mount sub-routers for nested resources
// Automatically passes /api/bugs/:bugId/activity to activityLogRouter
// ──────────────────────────────────────────────
router.use("/:bugId/activity", activityLogRouter);
router.use("/:bugId/comments", commentRouter);

// ──────────────────────────────────────────────
// Bug Resource Routes
// ──────────────────────────────────────────────
router.route("/")
  .get(getBugs)                                   // All logged-in
  .post(roleGuard("Tester"), createBug);          // Tester only

router.route("/:id")
  .get(getBugById)                                // All logged-in
  .put(roleGuard("Tester", "Manager"), updateBug) // Tester + Manager
  .delete(roleGuard("Manager"), deleteBug);       // Manager only

// Specially split routes for status & assignment per requirements
router.patch("/:id/status", roleGuard("Developer"), updateBugStatus); // Developer only
router.patch("/:id/assign", roleGuard("Manager"), assignBug);         // Manager only

module.exports = router;

