// routes/users.js — User Routes
// Base path: /api/users

const express = require("express");
const router = express.Router();

const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const protect = require("../middlewares/protect");
const roleGuard = require("../middlewares/roleGuard");

// All user routes require authentication
router.use(protect);

// ──────────────────────────────────────────────
// @route  GET /api/users
// @desc   List all users
// @access Private
// ──────────────────────────────────────────────
router.get("/", getAllUsers);

// ──────────────────────────────────────────────
// @route  GET /api/users/:id
// @desc   Get a user by ID
// @access Private
// ──────────────────────────────────────────────

// Updated Code By me:---------------------------


router.get("/:id", getUserById);

router.put("/:id", roleGuard("Manager"), updateUser);  //Update

router.delete("/:id", roleGuard("Manager"), deleteUser);   //Delete



module.exports = router;

