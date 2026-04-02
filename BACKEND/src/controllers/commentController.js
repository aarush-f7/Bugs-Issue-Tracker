// controllers/commentController.js
const Comment = require("../models/Comment");
const Bug = require("../models/Bug");

// @route   POST /api/bugs/:bugId/comments
// @desc    Add a comment to a bug
// @access  Private (All logged-in)
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { bugId } = req.params;

    if (!text) return res.status(400).json({ message: "Comment text is required." });

    // Ensure bug exists
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    const comment = await Comment.create({
      bug: bugId,
      author: req.user._id,
      text,
    });

    // Populate author info before returning
    await comment.populate("author", "name email role");

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid Bug ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/bugs/:bugId/comments
// @desc    List all comments on a bug
// @access  Private (All logged-in)
const getComments = async (req, res) => {
  try {
    const { bugId } = req.params;

    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    const comments = await Comment.find({ bug: bugId })
      .populate("author", "name email role")
      .sort({ createdAt: 1 }); // Oldest first (chronological order)

    res.status(200).json({ count: comments.length, comments });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid Bug ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   DELETE /api/bugs/:bugId/comments/:commentId
// @desc    Delete a comment
// @access  Private (Author or Manager)
const deleteComment = async (req, res) => {
  try {
    const { bugId, commentId } = req.params;

    const comment = await Comment.findOne({ _id: commentId, bug: bugId });
    if (!comment) return res.status(404).json({ message: "Comment not found." });

    // Check permissions: only comment author OR Manager can delete it
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "Manager"
    ) {
      return res.status(403).json({ message: "You don't have permission to delete this comment." });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
