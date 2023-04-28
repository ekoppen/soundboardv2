// connection.js
require('dotenv').config();

const mongoose = require("mongoose");
const connection = process.env.MONGO_URI;
const connectDb = () => {
  return mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
module.exports = connectDb;
