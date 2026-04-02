// controllers/userController.js — User Management
// Handles: fetching all users and getting a single user by ID

const User = require("../models/User");

// ─────────────────────────────────────────────────────────────
// @route   GET /api/users
// @desc    List all users (useful for assigning members to a project or bugs)
// @access  Private (All logged-in users)
// ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    // Find all users. 
    // We select only non-sensitive fields (password is automatically excluded by schema, but it's good practice)
    const users = await User.find({}).select("name email role createdAt");

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/users/:id
// @desc    Get a single user by ID
// @access  Private (All logged-in users)
// ─────────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    // Check if error is due to an invalid Object ID format
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(500).json({ message: "Server error. Please try again." });
  }
};


// Function to update a User with userID (Manager only);
// Updated Today----------------

const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};


// Function to delete a User with userID (Manager only);
// Updated Today----------------

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};


module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
