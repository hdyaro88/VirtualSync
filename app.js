const express = require("express");

require("dotenv").config();

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

//EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//body-parser
// app.use(express.urlencoded({ extended: true }));

//adding static files like css
// app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "assets1")));
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static('/public'));
app.use("/peerjs", peerServer);

app.get("/", function (req, res) {
  res.render("index1");
});

app.get("/room", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  console.log(req.params.room);
  if (req.params.room !== "index1" && req.params.room !== "notes1" && req.params.room !== "analyzer1") {
    res.render("room", { roomId: req.params.room });
  } else {
    if (req.params.room == "notes1") {
      res.render("notes1");
    } else if(req.params.room == "analyzer1") {
      res.render("analyzer1");
    }
    else{
      res.render("index1");
    }
  }
});

app.get("/notes1", function (req, res) {
  res.render("notes1");
});
app.get("/analyzer1", function (req, res) {
  res.render("analyzer1");
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId);
    console.log(userId);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

var PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server started on port ${PORT}`));
