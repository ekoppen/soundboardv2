// connection.js
const mongoose = require("mongoose");
const connection = "mongodb://10.10.100.10:27017/soundboard";
const connectDb = () => {
  return mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
module.exports = connectDb;
