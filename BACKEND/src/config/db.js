// db.js — MongoDB Connection
// This file connects our app to MongoDB using Mongoose.
// We call this function once in server.js when the app starts.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we await it
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection is successful, log the host name
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and exit the process
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
