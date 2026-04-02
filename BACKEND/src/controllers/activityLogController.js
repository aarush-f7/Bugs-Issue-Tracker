// controllers/activityLogController.js
const ActivityLog = require("../models/ActivityLog");
const Bug = require("../models/Bug");

// @route   GET /api/bugs/:bugId/activity
// @desc    Get activity log for a specific bug
// @access  Private (All logged-in)
const getActivityLog = async (req, res) => {
  try {
    const { bugId } = req.params;

    // Verify bug exists
    const bugExists = await Bug.findById(bugId);
    if (!bugExists) {
      return res.status(404).json({ message: "Bug not found." });
    }

    // Fetch all logs for this bug, sort from newest to oldest
    const activityLogs = await ActivityLog.find({ bug: bugId })
      .populate("changedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: activityLogs.length, activityLogs });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid Bug ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { getActivityLog };
