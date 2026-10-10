import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Chat from "./models/Chat.js";
import User from "./models/User.js";

export const initSocket = (server, app) => {
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "https://mommenta.vercel.app",
    ...(process.env.FRONTEND_URL || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Origin is not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(new Error("Invalid authentication token"));
    }
    if (!decoded || typeof decoded === "string" || !decoded.id) {
      return next(new Error("Invalid authentication token"));
    }

    let user;
    try {
      user = await User.findById(decoded.id).select("_id isBanned");
    } catch (error) {
      return next(error);
    }
    if (!user || user.isBanned) {
      return next(new Error("Account is unavailable"));
    }
    socket.data.userId = decoded.id.toString();
    return next();
  });

  const onlineUsers = new Map();
  app.set("io", io);
  app.set("onlineUsers", onlineUsers);

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const userSockets = onlineUsers.get(userId) || new Set();
    userSockets.add(socket.id);
    onlineUsers.set(userId, userSockets);
    socket.join(`user:${userId}`);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    socket.on("joinChat", async (chatId) => {
      try {
        const chat = await Chat.exists({ _id: chatId, members: userId });
        if (!chat) {
          socket.emit("chatError", { message: "Chat not found or access denied" });
          return;
        }
        socket.join(`chat:${chatId}`);
      } catch (error) {
        console.error("Socket chat join failed:", error);
        socket.emit("chatError", { message: "Unable to join chat" });
      }
    });

    const emitTypingStatus = async (chatId, event) => {
      try {
        const chat = await Chat.findOne({ _id: chatId, members: userId })
          .select("members")
          .lean();
        if (!chat) return;
        const recipientId = chat.members.find((memberId) => memberId.toString() !== userId);
        if (recipientId) {
          io.to(`user:${recipientId}`).emit(event, { chatId, senderId: userId });
        }
      } catch (error) {
        console.error("Socket typing update failed:", error);
      }
    };

    socket.on("typing", (chatId) => emitTypingStatus(chatId, "userTyping"));
    socket.on("stopTyping", (chatId) => emitTypingStatus(chatId, "userStopTyping"));

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      sockets?.delete(socket.id);
      if (sockets?.size === 0) onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};
