// models/User.js — User Schema
// Defines the shape of every user document stored in MongoDB.
// Each user has a name, email, hashed password, and a role.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // removes extra whitespace
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,           // no two users can have the same email
      lowercase: true,        // stores email in lowercase always
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,          // NEVER return password in query results by default
    },

    role: {
      type: String,
      enum: {
        values: ["Manager", "Tester", "Developer"],
        message: "Role must be Manager, Tester, or Developer",
      },
      required: [true, "Role is required"],
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// ─────────────────────────────────────────────────────────────
// Pre-save Hook — Hash password before saving to DB
// This runs automatically whenever a user document is saved.
// We only re-hash if the password field was actually changed.
// ─────────────────────────────────────────────────────────────
userSchema.pre("save", async function () {
  // If password was not modified (e.g. only name changed), skip hashing
  if (!this.isModified("password")) return;

  // Generate a salt (random string added to password before hashing)
  // 10 = cost factor — higher is more secure but slower
  const salt = await bcrypt.genSalt(10);

  // Hash the plain-text password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────────────────────
// Instance Method — Compare entered password with hashed password
// Used in login: user.matchPassword("plaintext") → true/false
// ─────────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
