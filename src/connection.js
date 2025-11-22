// connection.js
const mongoose = require("mongoose");

// Use environment variable for database connection, fallback to localhost
const connection = process.env.MONGODB_URI || "mongodb://localhost:27017/soundboard";

const connectDb = () => {
  return mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectDb;
