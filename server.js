// server.js
// Load environment variables first
require('dotenv').config();

const Sound = require("./src/sound-model");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const moment = require("moment");

const multer = require("multer");

const connectDb = require("./src/connection");
const mongoose = require("mongoose");
// Note: useFindAndModify is no longer needed in Mongoose 8+

const rateLimit = require("express-rate-limit");

// Discord Bot Integration
const DiscordBot = require("./src/discord-bot");
let discordBot = null;

// Studio Services
const youtubeDownloader = require("./src/services/youtube-downloader");
const audioProcessor = require("./src/services/audio-processor");
const { uuid: uuidv4 } = require("uuidv4");
const sanitize = require("sanitize-filename");
const fs = require("fs");
const path = require("path");

// In-memory sessions (vervang later met database indien nodig)
const studioSessions = new Map();

// Configure rate limiter with environment variables
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 30000, // 30 seconds default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests default
  message: "Te veel verzoeken van dit IP adres, probeer het later opnieuw."
});

// Get PORT from environment variables
const PORT = process.env.PORT || 3030;

app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to sensitive endpoints
app.use("/uploadSound", apiLimiter);
app.use("/update", apiLimiter);
app.use("/message", apiLimiter);

const multerConf = {
  storage: multer.diskStorage({
    destination: function (req, file, next) {
      if (file.fieldname === "mySound") {
        // if uploading sound
        console.log("uploading sound");
        next(null, "./public/uploads/sounds/");
      } else {
        // else uploading image
        console.log("uploading image");
        next(null, "./public/uploads/images/");
      }
    },
    filename: function (req, file, next) {
      //console.log(file);

      const name = file.originalname;

      const lastDot = name.lastIndexOf(".");
      const fileName = name.substring(0, lastDot);
      const ext = name.substring(lastDot + 1);

      const cleanName = fileName
        .slice(0, 15)
        .replace(/[&\/\\#\s,+()$~%.'":*?!<>{}]/g, "");

      const randomPart = moment().format("YYMMDD_HH_mm");

      next(null, cleanName + randomPart + "." + ext);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 0.5 },
  fileFilter: function (req, file, next) {
    if (!file) {
      next();
    }
    const image = file.mimetype === "image/jpg" ||
                  file.mimetype === "image/jpeg" ||
                  file.mimetype === "image/png";
    const audio = file.mimetype.startsWith("audio/");
    if (audio || image) {
      next(null, true);
    } else {
      next({ message: "Verkeerd bestandstype..." }, false);
    }
  },
};

function format(time) {
  // Hours, minutes and seconds
  const hrs = ~~(time / 3600);
  const mins = ~~((time % 3600) / 60);
  const secs = ~~time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";
  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }
  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

app.get("/upload", (req, res) => {
  res.render("upload", {
    imagePreview: "/uploads/images/pieuw.png",
  });
});

app.post(
  "/uploadSound",
  multer(multerConf).fields([{ name: "mySound" }, { name: "myImage" }]),
  async function (req, res, next) {
    try {
      // Validate that sound file was uploaded
      if (!req.files || !req.files["mySound"] || !req.files["mySound"][0]) {
        return res.status(400).render("error", {
          message: "Geen geluidsbestand geüpload. Upload een geluidsbestand."
        });
      }

      // Validate required fields
      if (!req.body.name || !req.body.searchTags) {
        return res.status(400).render("error", {
          message: "Titel en zoektags zijn verplicht."
        });
      }

      const soundName = req.files["mySound"][0].filename;
      const linkToFile = soundName.toString().split(" ").join("");
      console.log("Uploading sound file:", req.files["mySound"][0].filename);

      // Determine image filename
      const getImageName = () => {
        if (!req.files["myImage"] || !req.files["myImage"][0]) {
          return "pieuw.png";
        }
        return req.files["myImage"][0].filename;
      };

      // Save to MongoDB
      const sound = new Sound({
        title: req.body.name.toString(),
        search_tags: req.body.searchTags.toString(),
        audio_file: linkToFile,
        sound_length: req.body.f_du || "0:00",
        play_count: 0,
        active: 1,
        soundImage: getImageName(),
        waveform_data: req.body.waveform_data || "[]",
      });

      await sound.save();
      console.log("Sound saved successfully:", sound.title);

      // Notify all clients that a new sound was added
      io.emit("message", {
        boodschap: "Nieuw geluid toegevoegd!",
        type: "success",
        bericht: "Nieuw geluid toegevoegd!",
        duration: 3000
      });

      res.redirect("/");
    } catch (err) {
      console.error("Error uploading sound:", err);
      res.status(500).render("error", {
        message: "Fout bij uploaden: " + err.message
      });
    }
  }
);

app.get("/", async (req, res, next) => {
  try {
    const sounditems = await Sound.find({'active' : 1}).sort("-play_count");
    res.render("start", {
      sounditems: sounditems,
    });
  } catch (err) {
    console.error("Error loading soundboard:", err);
    next(err);
  }
});

// Health Check Endpoint (for Docker) - Must be before /:id route
app.get("/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now()
  };

  // Check database connection
  if (mongoose.connection.readyState === 1) {
    healthcheck.database = "connected";
    res.status(200).json(healthcheck);
  } else {
    healthcheck.database = "disconnected";
    res.status(503).json(healthcheck);
  }
});

// ========================================
// STUDIO ROUTES
// ========================================

// Studio page
app.get("/studio", (req, res) => {
  res.render("studio");
});

// Download YouTube audio
app.post("/studio/youtube/download", apiLimiter, async (req, res) => {
  try {
    const { youtube_url } = req.body;

    if (!youtube_url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    // Validate URL
    if (!youtubeDownloader.isValidYouTubeURL(youtube_url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Extract video ID
    const videoId = youtubeDownloader.extractVideoID(youtube_url);
    if (!videoId) {
      return res.status(400).json({ error: "Could not extract video ID" });
    }

    // Create session
    const sessionId = uuidv4();

    // Emit download started
    io.emit(`studio:download:${sessionId}`, {
      status: "downloading",
      percent: 0
    });

    // Start download (async)
    youtubeDownloader.downloadAudio(youtube_url)
      .then(async (result) => {
        // Emit progress
        io.emit(`studio:download:${sessionId}`, { percent: 50 });

        // Get metadata
        const metadata = await audioProcessor.getAudioMetadata(result.filePath);

        // Emit progress
        io.emit(`studio:download:${sessionId}`, { percent: 75 });

        // Generate waveform
        const waveformData = await audioProcessor.extractWaveformPeaks(result.filePath, 1000);

        // Emit progress
        io.emit(`studio:download:${sessionId}`, { percent: 90 });

        // Store session with audio URL
        const audioUrl = `/uploads/temp/youtube/${result.filename}`;
        studioSessions.set(sessionId, {
          sessionId,
          youtube_url,
          videoId: result.videoInfo.videoId,
          videoTitle: result.videoInfo.title,
          thumbnail: result.videoInfo.thumbnail,
          filePath: result.filePath,
          filename: result.filename,
          audioUrl: audioUrl,
          duration: metadata.duration,
          waveformData: JSON.stringify(waveformData),
          status: "ready"
        });

        // Emit completion
        io.emit(`studio:download:${sessionId}`, {
          status: "completed",
          percent: 100,
          session: studioSessions.get(sessionId)
        });
      })
      .catch((error) => {
        console.error("YouTube download error:", error);
        io.emit(`studio:download:${sessionId}`, {
          status: "failed",
          error: error.message
        });
      });

    res.json({
      success: true,
      sessionId,
      message: "Download started"
    });
  } catch (error) {
    console.error("Studio download error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload audio file for Studio
const studioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'public', 'uploads', 'temp', 'studio');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const sessionId = uuidv4();
      const ext = path.extname(file.originalname);
      req.studioSessionId = sessionId;
      cb(null, `${sessionId}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /mp3|wav|ogg|m4a|flac/;
    const allowedMimeTypes = /audio\/(mpeg|mp3|wav|x-wav|ogg|x-m4a|mp4|flac|x-flac)/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Alleen audio bestanden zijn toegestaan (MP3, WAV, OGG, M4A, FLAC)'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

app.post("/studio/upload", apiLimiter, studioUpload.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Geen bestand geüpload" });
    }

    const sessionId = req.studioSessionId;
    const filePath = req.file.path;
    const filename = req.file.filename;
    const originalFilename = req.file.originalname;

    // Get metadata
    const metadata = await audioProcessor.getAudioMetadata(filePath);

    // Generate waveform
    const waveformData = await audioProcessor.extractWaveformPeaks(filePath, 1000);

    // Store session with audio URL
    const audioUrl = `/uploads/temp/studio/${filename}`;
    studioSessions.set(sessionId, {
      sessionId,
      sourceType: 'upload',
      originalFilename,
      filePath: filePath,
      filename: filename,
      audioUrl: audioUrl,
      duration: metadata.duration,
      waveformData: JSON.stringify(waveformData),
      status: "ready"
    });

    res.json({
      success: true,
      sessionId,
      session: studioSessions.get(sessionId),
      message: "Upload voltooid"
    });
  } catch (error) {
    console.error("Studio upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get session status
app.get("/studio/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = studioSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  // Return session data with audio URL
  res.json({
    ...session,
    audioUrl: `/uploads/temp/youtube/${session.filename}`
  });
});

// Process audio and save to soundboard
app.post("/studio/process", apiLimiter, multer(multerConf).fields([{ name: "customImage" }]), async (req, res) => {
  try {
    const {
      sessionId,
      title,
      tags,
      imageChoice
    } = req.body;

    // Parse effects from JSON string (FormData sends it as string)
    const effects = req.body.effects ? JSON.parse(req.body.effects) : {};

    if (!sessionId || !title) {
      return res.status(400).json({ error: "Session ID and title are required" });
    }

    const session = studioSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Generate output filename
    const sanitizedTitle = sanitize(title).substring(0, 50);
    const outputFilename = `${Date.now()}-${sanitizedTitle}.mp3`;

    // Process audio with effects
    const outputPath = await audioProcessor.processAudio(
      session.filePath,
      effects || {},
      outputFilename
    );

    // Get final duration
    const finalMetadata = await audioProcessor.getAudioMetadata(outputPath);
    const formattedDuration = audioProcessor.formatDuration(finalMetadata.duration);

    // Generate waveform for final audio
    const finalWaveform = await audioProcessor.extractWaveformPeaks(outputPath, 1000);

    // Handle image - either custom upload or YouTube thumbnail
    let imageFilename = 'pieuw.png'; // Default fallback

    if (imageChoice === 'upload' && req.files && req.files.customImage) {
      // Use custom uploaded image
      const uploadedImage = req.files.customImage[0];
      imageFilename = uploadedImage.filename;
      console.log(`✅ Custom image uploaded: ${imageFilename}`);
    } else if (imageChoice === 'thumbnail' && session.thumbnail) {
      // Download and save YouTube thumbnail as image
      try {
        const https = require('https');
        const http = require('http');

        imageFilename = `${Date.now()}-${session.videoId}.jpg`;
        const imagePath = path.join(__dirname, 'public/uploads/images', imageFilename);

        // Ensure images directory exists
        const imagesDir = path.join(__dirname, 'public/uploads/images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Download thumbnail using https/http
        await new Promise((resolve, reject) => {
          const client = session.thumbnail.startsWith('https') ? https : http;
          client.get(session.thumbnail, (response) => {
            if (response.statusCode === 200) {
              const fileStream = fs.createWriteStream(imagePath);
              response.pipe(fileStream);
              fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Thumbnail saved: ${imageFilename}`);
                resolve();
              });
              fileStream.on('error', reject);
            } else {
              reject(new Error(`HTTP ${response.statusCode}`));
            }
          }).on('error', reject);
        });
      } catch (error) {
        console.error('⚠️  Failed to download thumbnail:', error.message);
        imageFilename = 'pieuw.png'; // Fallback to default
      }
    }

    // Save to database
    const sound = await Sound.create({
      title: title,
      audio_file: outputFilename,
      soundImage: imageFilename,
      search_tags: tags || "",
      sound_length: formattedDuration,
      play_count: 0,
      active: 1,
      waveform_data: JSON.stringify(finalWaveform),
      source_type: "studio",
      youtube_url: session.youtube_url,
      youtube_id: session.videoId,
      original_audio_file: session.filename,
      audio_effects: effects || {},
      processing_status: "completed"
    });

    // Cleanup temp file
    youtubeDownloader.deleteFile(session.filePath);

    // Remove session
    studioSessions.delete(sessionId);

    res.json({
      success: true,
      soundId: sound._id,
      message: "Sound saved successfully"
    });
  } catch (error) {
    console.error("Studio process error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete/cleanup session
app.delete("/studio/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = studioSessions.get(sessionId);

  if (session && session.filePath) {
    youtubeDownloader.deleteFile(session.filePath);
  }

  studioSessions.delete(sessionId);

  res.json({ success: true, message: "Session deleted" });
});

// ========================================
// SOUND BY ID ROUTE (must be after specific routes)
// ========================================

app.get('/:id', async function(req, res, next) {
  const id = req.params.id;

  try {
    const sounditems = await Sound.find({'_id' : id});
    res.render("start", {
      sounditems: sounditems
    });
  }
  catch (err){
    console.error("Error loading sound by ID:", err);
    res.redirect("/");
  }
});

app.post("/message", async function(req, res){
  try {
    const type = req.body.type;
    const message = req.body.bericht;
    const duration = req.body.duration;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    io.emit("message", {
      boodschap: message,
      type: type || "info",
      bericht: message,
      duration: duration || 3000
    });

    res.status(200).json({ success: true });
  }
  catch(err){
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}) 

app.post("/update", async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ error: "Sound ID is required" });
    }

    const fileId = new mongoose.Types.ObjectId(req.body.id);

    const updatedDoc = await Sound.findOneAndUpdate(
      { _id: fileId },
      { $inc: { play_count: 1 } },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Sound not found" });
    }

    // Emit updated play count to all clients
    io.emit("inhoud", {
      id: fileId,
      counter: updatedDoc.play_count
    });

    // Play sound in Discord if bot is connected and enabled
    console.log('🔍 Discord check:', {
      discordBotExists: !!discordBot,
      audioFile: updatedDoc.audio_file,
      botStatus: discordBot ? discordBot.getStatus() : null
    });

    if (discordBot && updatedDoc.audio_file) {
      console.log('🎵 Attempting to play sound in Discord:', updatedDoc.audio_file);
      await discordBot.playSound(updatedDoc.audio_file);
    }

    res.status(200).json({
      success: true,
      playCount: updatedDoc.play_count
    });
  } catch (err) {
    console.error("Error updating play count:", err);
    res.status(500).json({ error: "Failed to update play count" });
  }
});

// Discord Bot API Endpoints
// ========================================

// Get Discord bot status
app.get("/api/discord/status", (req, res) => {
  if (!discordBot) {
    return res.json({
      enabled: false,
      message: "Discord integration not enabled"
    });
  }

  const status = discordBot.getStatus();
  res.json({
    enabled: true,
    ...status
  });
});

// Toggle Discord playback on/off
app.post("/api/discord/toggle", (req, res) => {
  if (!discordBot) {
    return res.status(400).json({
      error: "Discord bot not initialized"
    });
  }

  const enabled = req.body.enabled === true || req.body.enabled === "true";
  discordBot.togglePlayback(enabled);

  res.json({
    success: true,
    enabled: discordBot.playbackEnabled
  });
});

// Join voice channel
app.post("/api/discord/join", async (req, res) => {
  if (!discordBot) {
    return res.status(400).json({
      error: "Discord bot not initialized"
    });
  }

  const success = await discordBot.joinVoiceChannel();
  res.json({
    success: success,
    message: success ? "Joined voice channel" : "Failed to join voice channel"
  });
});

// Leave voice channel
app.post("/api/discord/leave", (req, res) => {
  if (!discordBot) {
    return res.status(400).json({
      error: "Discord bot not initialized"
    });
  }

  const success = discordBot.leaveVoiceChannel();
  res.json({
    success: success,
    message: success ? "Left voice channel" : "Not in voice channel"
  });
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "Development" ? err : {};

  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
  });
});

io.on("connection", (socket) => {
  //console.log('a user connected');
  //console.log(socket.client.conn.server.clientsCount + " users connected");
  io.emit("users", socket.client.conn.server.clientsCount);
  //welcome current user
  //socket.emit('message', 'Welkom bij het soundboard.');
  socket.on("disconnect", () => {
    //console.log('user disconnected');
    //console.log(socket.client.conn.server.clientsCount + " users connected");
    io.emit("users", socket.client.conn.server.clientsCount);
  });
});

http.listen(PORT, async function () {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Connect to MongoDB
  connectDb()
    .then(() => {
      console.log("✅ MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      console.error("Please check your MONGODB_URI in .env file");
      process.exit(1);
    });

  // Initialize Discord Bot if enabled
  console.log(`DEBUG: DISCORD_ENABLED = "${process.env.DISCORD_ENABLED}" (type: ${typeof process.env.DISCORD_ENABLED})`);

  if (process.env.DISCORD_ENABLED === 'true') {
    console.log('🎮 Discord integration enabled');
    discordBot = new DiscordBot();
    const connected = await discordBot.connect();

    if (connected) {
      console.log('✅ Discord bot ready!');
    } else {
      console.log('⚠️  Discord bot failed to initialize');
      discordBot = null;
    }
  } else {
    console.log('ℹ️  Discord integration disabled (set DISCORD_ENABLED=true to enable)');
  }
});
