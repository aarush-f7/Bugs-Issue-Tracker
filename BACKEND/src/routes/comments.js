// routes/comments.js — Comment Routes
// Base path nested inside bugs.js: /api/bugs/:bugId/comments
// mergeParams: true allows access to :bugId

const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middlewares/protect");

// All comment routes require authentication
router.use(protect);

router.route("/")
  .get(getComments)             // All logged-in
  .post(addComment);            // All logged-in

router.route("/:commentId")
  .delete(deleteComment);       // Author or Manager (handled in controller logic)

module.exports = router;
