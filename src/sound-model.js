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
    waveform_data: String, // JSON array of normalized waveform values

    // Studio feature fields
    source_type: {
      type: String,
      enum: ['upload', 'youtube', 'studio'],
      default: 'upload'
    },
    youtube_url: String, // Original YouTube URL
    youtube_id: String, // YouTube video ID

    // Audio processing metadata
    original_audio_file: String, // Reference to unprocessed file
    audio_effects: {
      echo_type: { type: String, default: 'none' }, // none, short, medium, long
      distortion_level: { type: Number, default: 0 }, // 0-100%
      reverb_type: { type: String, default: 'none' }, // none, small, large
      bass_boost: { type: Number, default: 0 }, // dB (-12 to +12)
      trim_start: { type: Number, default: 0 }, // seconds
      trim_end: { type: Number, default: null } // seconds (null = end of file)
    },

    processing_status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    processing_error: String,
  },
  { timestamps: { createdAt: "created_at" } }
);
const Sound = mongoose.model("Sound", soundSchema);
module.exports = Sound;
