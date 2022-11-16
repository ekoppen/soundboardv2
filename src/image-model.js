// User.model.js
const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema(
  {
    class: String,
    title: String,
    image_file: String,
  },
  { timestamps: { createdAt: "created_at" } }
);
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
