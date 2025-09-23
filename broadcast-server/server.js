const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chat message", (msg) => {
    console.log(`${msg.user}: ${msg.text}`);
    io.emit("chat message", msg);
  });

  socket.on("typing", (user) => {
    io.emit("typing", user);
  });

  socket.on("stop typing", (user) => {
    io.emit("stop typing", user);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log("Server running on http://localhost:3000");
});
