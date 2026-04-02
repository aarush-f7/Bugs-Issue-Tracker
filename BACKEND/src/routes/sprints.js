// routes/sprints.js — Sprint Routes
// Base path: /api/sprints

const express = require("express");
const router = express.Router();

const {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
} = require("../controllers/sprintController");

// Middlewares
const protect = require("../middlewares/protect");
const roleGuard = require("../middlewares/roleGuard");

// All routes require authentication
router.use(protect);

// Routes
router.route("/")
  .get(getSprints)                              // All logged-in
  .post(roleGuard("Manager"), createSprint);    // Manager only

router.route("/:id")
  .get(getSprintById)                           // All logged-in
  .put(roleGuard("Manager"), updateSprint)      // Manager only
  .delete(roleGuard("Manager"), deleteSprint);  // Manager only

module.exports = router;

