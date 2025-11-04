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
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = ~~time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";
  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }
  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

app.get("/upload", (req, res) => {
  res.render("upload", {
    imagePreview: "uploads/images/pieuw.png",
  });
});

app.post(
  "/uploadSound",
  multer(multerConf).fields([{ name: "mySound" }, { name: "myImage" }]),
  async function (req, res) {
    //check for file
    const soundName = req.files["mySound"][0].filename;
    const linkToFile = soundName.toString().split(" ").join("");
    console.log(req.files["mySound"][0]);
    
    var imageName = function () {
      if (!req.files["myImage"]) {
        //console.log("geen image geupload");
        return (soundImage = "pieuw.png");
      } else {
        //console.log("wel een image geupload");
        return (imageName = req.files["myImage"][0].filename);
      }
    };
    try {
      //save to mongoDB
      
      const sound = new Sound({
        //class: req.body.class.toString(),
        title: req.body.name.toString(),
        search_tags: req.body.searchTags.toString(),
        audio_file: linkToFile,
        sound_length: req.body.f_du,
        play_count: 0,
        active: 1,
        soundImage: imageName(),
      });

      await sound.save();

      // Notify all clients that a new sound was added
      io.emit("message", {
        boodschap: "Nieuw geluid toegevoegd!",
        type: "success",
        bericht: "Nieuw geluid toegevoegd!",
        duration: 3000
      });

      res.redirect("/");
      //res.send("New Sound created \n");

      
    } catch (err) {
      console.log(err);
    }
  }
);

app.get("/", async (req, res) => {
  //var sounditems = await Sound.find().sort("-play_count");
  var sounditems = await Sound.find({'active' : 1}).sort("-play_count");
  //console.log(sounditems);
  res.render("start", {
    sounditems: sounditems,
  });
});

app.get('/:id', async function(req, res) {
  var id = req.params.id;
  
  try { var sounditems = await Sound.find({'_id' : id});
        res.render("start", {
        sounditems: sounditems,
  });
  }
  catch (e){
        console.log(e);
        res.redirect("/");
  }


  
 });

app.post("/message", async function(req, res){
  try {
    var type = req.body.type
    var message = req.body.bericht;
    var duration = req.body.duration;
    io.emit("message", {
      boodschap: message,
          type: type,
          bericht: message,
          duration: duration
        })
    res.end();

  }
  catch(e){
    console.log(e)
  }
}) 

app.post("/update", async (req, res) => {
  try {
    var fileId = mongoose.Types.ObjectId(req.body.id);
    //var length = format(req.body.duration);
    //console.log(length);
    const doc = await Sound.findOneAndUpdate(
      { _id: fileId },
      { $inc: { play_count: 1 } },
      //{ play_count: fileCounterNew },
      { new: true }
    );
    const updatedDoc = await Sound.findById({ _id: fileId });
    //console.log(updatedDoc);
    io.emit("inhoud", { id: fileId, counter: updatedDoc.play_count });
    //console.log(doc.play_count);
    res.end();
  } catch (err) {
    console.log(err);
  }
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

http.listen(PORT, function () {
  console.log("listening on *:" + PORT);
  connectDb().then(() => {
    console.log("MongoDb connected");
  });
});
