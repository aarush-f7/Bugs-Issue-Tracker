// controllers/sprintController.js
const Sprint = require("../models/Sprint");
const Project = require("../models/Project");

// @route   POST /api/sprints
// @desc    Create a sprint
// @access  Private (Manager)
const createSprint = async (req, res) => {
  try {
    const { name, project, startDate, endDate, status } = req.body;

    // Validate requirements
    if (!name || !project || !startDate || !endDate) {
      return res.status(400).json({ message: "Please provide name, project, startDate, and endDate." });
    }

    // Ensure the project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found." });
    }

    const sprint = await Sprint.create({
      name,
      project,
      startDate,
      endDate,
      status: status || "Planned",
    });

    res.status(201).json({ message: "Sprint created successfully", sprint });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid Project ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/sprints?projectId=xxx
// @desc    List all sprints for a specific project
// @access  Private (All logged-in)
const getSprints = async (req, res) => {
  try {
    const { projectId } = req.query;
    
    // We can allow fetching all sprints if no projectId is passed, 
    // but usually in a Jira-like app you view sprints per project.
    const query = projectId ? { project: projectId } : {};

    const sprints = await Sprint.find(query).populate("project", "name");
    
    res.status(200).json({ count: sprints.length, sprints });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(400).json({ message: "Invalid Project ID format." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/sprints/:id
// @desc    Get one sprint by ID
// @access  Private (All logged-in)
const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate("project", "name");

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found." });
    }

    res.status(200).json({ sprint });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Sprint not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   PUT /api/sprints/:id
// @desc    Update sprint details
// @access  Private (Manager)
const updateSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;

    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found." });
    }

    // Update fields if provided
    sprint.name = name || sprint.name;
    sprint.startDate = startDate || sprint.startDate;
    sprint.endDate = endDate || sprint.endDate;
    sprint.status = status || sprint.status;

    const updatedSprint = await sprint.save();
    
    res.status(200).json({ message: "Sprint updated successfully", sprint: updatedSprint });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Sprint not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   DELETE /api/sprints/:id
// @desc    Delete sprint
// @access  Private (Manager)
const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found." });
    }

    await sprint.deleteOne();
    
    res.status(200).json({ message: "Sprint removed successfully." });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Sprint not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
};
