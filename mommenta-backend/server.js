import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import notificationRoutes from "./routes/notifications.js";
import searchRoutes from "./routes/search.js";
import hashtagRoutes from "./routes/hashtags.js";
import messageRoutes from "./routes/messages.js";
import exploreRoutes from "./routes/explore.js";
import storyRoutes from "./routes/stories.js";
import saveRoutes from "./routes/save.js";
import settingsRoutes from "./routes/settings.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",  // 👈 your frontend
    credentials: true,                // 👈 allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // 👈 not "*"
    methods: ["GET", "POST"],
    credentials: true,
  },
});




// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/saves", saveRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user joins (frontend sends userId after login)
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("Online Users:", onlineUsers);
  });

  // Send and receive messages
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiverSocket = onlineUsers.get(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        senderId,
        text,
        createdAt: new Date()
      });
    }
  });
  socket.on("messageRead", ({ senderId, receiverId }) => {
    const senderSocket = onlineUsers.get(senderId);
    if (senderSocket) {
      io.to(senderSocket).emit("messageReadConfirmation", { receiverId });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
  
      // Broadcast online status
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  

const PORT = process.env.PORT || 5000;
server.listen(5000, () => {
    console.log("Server running on port 5000");
  });