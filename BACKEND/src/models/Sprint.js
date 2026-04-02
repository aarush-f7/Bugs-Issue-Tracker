// models/Sprint.js — Sprint Schema
const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sprint name is required"],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["Planned", "Active", "Completed"],
        message: "Status must be Planned, Active, or Completed",
      },
      default: "Planned",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sprint", sprintSchema);
