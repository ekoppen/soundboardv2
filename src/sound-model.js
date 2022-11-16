// User.model.js
const mongoose = require("mongoose");
const soundSchema = new mongoose.Schema(
  {
    class: String,
    title: String,
    audio_file: String,
    image_file: String,
    play_count: Number,
    search_tags: String,
    sound_length: String,
    soundImage: String,
    active: Number,
  },
  { timestamps: { createdAt: "created_at" } }
);
const Sound = mongoose.model("Sound", soundSchema);
module.exports = Sound;
