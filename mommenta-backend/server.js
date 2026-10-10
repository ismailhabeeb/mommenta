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

const app = express();
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://mommenta.vercel.app",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS"));
      }
    },
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

app.use((error, _req, res, next) => {
  console.error("Request failed:", error);
  if (res.headersSent) return next(error);

  const status =
    error.code === "LIMIT_FILE_SIZE" || error.status === 413 || error.type === "entity.too.large" ? 413 :
      error.name === "MulterError" || error.status === 400 ? 400 :
        500;
  const msg = status === 413
    ? "The request or uploaded file exceeds the allowed size limit"
    : status === 400
      ? error.message
      : "Server error";
  res.status(status).json({ msg });
});

const server = createServer(app);
initSocket(server, app);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
