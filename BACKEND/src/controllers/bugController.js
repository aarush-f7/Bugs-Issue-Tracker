// controllers/bugController.js
const Bug = require("../models/Bug");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const ActivityLog = require("../models/ActivityLog");

// Helper function to create an activity log
const logActivity = async (bugId, userId, field, oldValue, newValue) => {
  if (String(oldValue) !== String(newValue)) {
    await ActivityLog.create({
      bug: bugId,
      changedBy: userId,
      field,
      oldValue: oldValue ? String(oldValue) : "None",
      newValue: newValue ? String(newValue) : "None",
    });
  }
};

// @route   POST /api/bugs
// @desc    Create a bug
// @access  Private (Tester)
const createBug = async (req, res) => {
  try {
    const { title, description, priority, project, sprint } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Title and Project are required." });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) return res.status(404).json({ message: "Project not found." });

    if (sprint) {
      const sprintExists = await Sprint.findById(sprint);
      if (!sprintExists) return res.status(404).json({ message: "Sprint not found." });
    }

    const bug = await Bug.create({
      title,
      description,
      priority: priority || "Medium",
      status: "To Do",
      project,
      sprint,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Bug created successfully", bug });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/bugs?projectId=xxx
// @desc    List all bugs (filterable by project)
// @access  Private (All logged-in)
const getBugs = async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = projectId ? { project: projectId } : {};

    const bugs = await Bug.find(query)
      .populate("project", "name")
      .populate("sprint", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(200).json({ count: bugs.length, bugs });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid Project ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/bugs/:id
// @desc    Get one bug
// @access  Private (All logged-in)
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("project", "name")
      .populate("sprint", "name")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    if (!bug) return res.status(404).json({ message: "Bug not found." });

    res.status(200).json({ bug });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Bug not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   PUT /api/bugs/:id
// @desc    Edit bug details (title, description, priority, sprint) (NO status or assignee)
// @access  Private (Tester + Manager)
const updateBug = async (req, res) => {
  try {
    const { title, description, priority, sprint } = req.body;
    const bug = await Bug.findById(req.params.id);

    if (!bug) return res.status(404).json({ message: "Bug not found." });

    // Ensure the updater is the creator (if Tester) or a Manager
    if (req.user.role === "Tester" && req.user._id.toString() !== bug.createdBy.toString()) {
      return res.status(403).json({ message: "Testers can only update bugs they created." });
    }

    bug.title = title || bug.title;
    bug.description = description !== undefined ? description : bug.description;
    bug.priority = priority || bug.priority;
    if (sprint) bug.sprint = sprint;

    const updatedBug = await bug.save();

    res.status(200).json({ message: "Bug updated successfully", bug: updatedBug });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   PATCH /api/bugs/:id/status
// @desc    Update bug status
// @access  Private (Developer only)
const updateBugStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Please provide a status." });

    /// Added today---------------------------
    if (!req.user) return res.status(401).json({ message: "Unauthorized." });
    if (req.user.role !== "Developer") return res.status(403).json({ message: "Only developers can update bug status." });

    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    // Log the activity if status changed
    const oldStatus = bug.status;

    bug.status = status;
    const updatedBug = await bug.save();

    // Fire & Forget logging
    logActivity(bug._id, req.user._id, "status", oldStatus, status).catch((err) =>
      console.error("Activity log failed:", err));

    res.status(200).json({ message: "Bug status updated", bug: updatedBug });
  } catch (error) {
    console.error("updateBugStatus error:", error.message);   /// Added today----------------
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   PATCH /api/bugs/:id/assign
// @desc    Assign developer to bug
// @access  Private (Manager only)
const assignBug = async (req, res) => {
  try {
    const { assignedTo } = req.body; // user ID of developer
    if (!assignedTo) return res.status(400).json({ message: "Please provide a user ID to assign." });

    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    const oldAssignee = bug.assignedTo;

    bug.assignedTo = assignedTo;
    const updatedBug = await bug.save();

    // Fire & Forget logging
    await logActivity(bug._id, req.user._id, "assignedTo", oldAssignee, assignedTo);

    await updatedBug.populate("assignedTo", "name email");

    res.status(200).json({ message: "Bug assigned successfully", bug: updatedBug });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   DELETE /api/bugs/:id
// @desc    Delete bug
// @access  Private (Manager)
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    await bug.deleteOne();
    // Optionally we could delete related comments and logs here, but cascading delete is beyond basic scope unless requested
    await ActivityLog.deleteMany({ bug: bug._id }); // Good practice to clean up logs

    res.status(200).json({ message: "Bug deleted successfully." });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Bug not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  updateBugStatus,
  assignBug,
  deleteBug,
};
