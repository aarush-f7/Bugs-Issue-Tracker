// controllers/projectController.js
const Project = require("../models/Project");

// @route   POST /api/projects
// @desc    Create a project
// @access  Private (Manager)
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id], // Optionally add the manager automatically to the project
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/projects
// @desc    List all projects
// @access  Private (All logged-in)
const getProjects = async (req, res) => {
  try {
    // Populate createdBy and members to get actual user names instead of just ObjectIds
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json({ count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/projects/:id
// @desc    Get one project
// @access  Private (All logged-in)
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({ project });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Project not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Manager)
const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Update fields
    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;

    const updatedProject = await project.save();
    res.status(200).json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Project not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Manager)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await project.deleteOne();
    res.status(200).json({ message: "Project removed successfully." });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Project not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   POST /api/projects/:id/members
// @desc    Assign members to project
// @access  Private (Manager)
const assignMembers = async (req, res) => {
  try {
    const { userIds } = req.body; // Expecting an array of user IDs

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Please provide an array of userIds." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Add new user IDs to members array, avoiding duplicates
    userIds.forEach(userId => {
      if (!project.members.includes(userId)) {
        project.members.push(userId);
      }
    });

    const updatedProject = await project.save();

    // Populate members before sending response
    await updatedProject.populate("members", "name email role");

    res.status(200).json({ message: "Members assigned successfully", project: updatedProject });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Project not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove a member from project
// @access  Private (Manager)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const userIdToRemove = req.params.userId;

    // Filter out the user ID to remove
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userIdToRemove
    );

    const updatedProject = await project.save();
    await updatedProject.populate("members", "name email role");

    res.status(200).json({ message: "Member removed successfully", project: updatedProject });
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Project not found." });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
};
