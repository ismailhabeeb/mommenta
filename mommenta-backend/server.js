import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js"; // ✅ import socket setup

// Routes
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
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Static and Routes
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/saves", saveRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

// Create server and initialize socket
const server = createServer(app);
initSocket(server, app); // ✅ pass both server and app to socket setup

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
