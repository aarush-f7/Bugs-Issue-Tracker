// models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    bug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      required: [true, "Bug ID is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
  },
  {
    timestamps: true, // we mainly need createdAt for timestamps
  }
);

module.exports = mongoose.model("Comment", commentSchema);
