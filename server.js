const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMsg = require("./utils/messages");
const {
  userJoin,
  getCurrUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const cors = require("cors");
const app = express();

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "",
    methods: ["GET", "POST"],
    credential: true,
  },
});
app.use(cors());
//Set Static Folder
app.use(express.static(path.join(__dirname, "public")));
const bot = "Bot";
//Run when client connects
io.on("connection", (socket) => {
  socket.on("joinroom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Message to the user connection
    socket.emit("message", formatMsg(bot, "Welcome to Chatroom!"));

    //Broadcasts: message to all users except the one connecting
    socket.broadcast
      .to(user.room)
      .emit("message", formatMsg(bot, `${user.username} has joined the chat`));

    //Send users and room info
    io.to(user.room).emit("roomusers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrUser(socket.id);

    io.to(user.room).emit("message", formatMsg(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMsg(bot, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomusers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
