// models/ActivityLog.js — Activity Log Schema
// Automatically tracks history of bug status and assignee changes.

const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    bug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    field: {
      type: String,
      enum: ["status", "assignedTo"],
      required: true,
    },
    oldValue: {
      type: String, // Stringified previous value (e.g. "To Do", or "oldUserId")
    },
    newValue: {
      type: String, // Stringified new value (e.g. "In Progress", or "newUserId")
    },
  },
  {
    timestamps: true, // Only createdAt is really used
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
