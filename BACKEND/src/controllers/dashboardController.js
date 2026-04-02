// controllers/dashboardController.js
// Handles analytics and statistics for the dashboard views.

const Bug = require("../models/Bug");
const mongoose = require("mongoose");

// Helper function to build the aggregation pipeline
const buildAggregationPipeline = (projectId = null) => {
  const matchStage = {};
  
  if (projectId) {
    matchStage.project = new mongoose.Types.ObjectId(projectId);
  }

  return [
    { $match: matchStage }, // Filter by project if provided
    {
      $facet: {
        // 1. Group by Status
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ],
        // 2. Group by Priority
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
        // 3. Group by Assignee
        byAssignee: [
          { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
          // Lookup user details to get name instead of just ObjectId
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              count: 1,
              name: { $ifNull: ["$user.name", "Unassigned"] },
            },
          },
        ],
        // 4. Total count of bugs
        totalBugs: [
          { $count: "count" }
        ]
      },
    },
  ];
};

// ─────────────────────────────────────────────────────────────
// Formats the raw aggregation result into a cleaner object
// ─────────────────────────────────────────────────────────────
const formatStats = (result) => {
  const data = result[0];
  
  // Convert arrays to easier key-value pairs for frontend charts
  const formatArray = (arr, keyField = "_id") => {
    return arr.reduce((acc, curr) => {
      acc[curr[keyField] || "Unassigned"] = curr.count;
      return acc;
    }, {});
  };

  return {
    totalBugs: data.totalBugs[0]?.count || 0,
    byStatus: formatArray(data.byStatus),
    byPriority: formatArray(data.byPriority),
    byAssignee: formatArray(data.byAssignee, "name"),
  };
};

// @route   GET /api/dashboard/stats
// @desc    Get overall bug statistics across all projects
// @access  Private (All logged-in)
const getOverallStats = async (req, res) => {
  try {
    const pipeline = buildAggregationPipeline();
    const result = await Bug.aggregate(pipeline);
    
    res.status(200).json({ stats: formatStats(result) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/dashboard/project/:projectId
// @desc    Get bug statistics filtered by a specific project
// @access  Private (All logged-in)
const getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID format." });
    }

    const pipeline = buildAggregationPipeline(projectId);
    const result = await Bug.aggregate(pipeline);
    
    res.status(200).json({ stats: formatStats(result) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  getOverallStats,
  getProjectStats,
};
