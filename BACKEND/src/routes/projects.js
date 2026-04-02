// routes/projects.js — Project Routes
// Base path: /api/projects

const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
} = require("../controllers/projectController");

// Middlewares
const protect = require("../middlewares/protect");
const roleGuard = require("../middlewares/roleGuard");

// All routes require authentication
router.use(protect);

// Routes
router.route("/")
  .get(getProjects)                               // All logged-in users
  .post(roleGuard("Manager"), createProject);     // Manager only

router.route("/:id")
  .get(getProjectById)                            // All logged-in users
  .put(roleGuard("Manager"), updateProject)       // Manager only
  .delete(roleGuard("Manager"), deleteProject);   // Manager only

router.post("/:id/members", roleGuard("Manager"), assignMembers);
router.delete("/:id/members/:userId", roleGuard("Manager"), removeMember);

module.exports = router;

