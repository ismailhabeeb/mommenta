import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";
import User from "./models/User.js";

const isValidConversationId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const acknowledge = (callback, response) => {
  if (typeof callback === "function") callback(response);
};

const isConversationMember = (chatId, userId) =>
  Chat.exists({ _id: chatId, members: userId });

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

    try {
      const user = await User.findById(decoded.id).select("_id isBanned");
      if (!user || user.isBanned) {
        return next(new Error("Account is unavailable"));
      }
      socket.data.userId = user._id.toString();
      return next();
    } catch (error) {
      return next(error);
    }
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

    // Compatibility event: identity is already established by JWT middleware.
    socket.on("join", () => {});

    socket.on("joinChat", async (chatId, callback) => {
      if (!isValidConversationId(chatId)) {
        socket.emit("chatError", { message: "Chat not found or access denied" });
        acknowledge(callback, { ok: false, error: "Unable to join chat" });
        return;
      }

      try {
        const chat = await isConversationMember(chatId, userId);
        if (!chat) {
          socket.emit("chatError", { message: "Chat not found or access denied" });
          acknowledge(callback, { ok: false, error: "Unable to join chat" });
          return;
        }
        await socket.join(`chat:${chatId}`);
        acknowledge(callback, { ok: true });
      } catch {
        socket.emit("chatError", { message: "Unable to join chat" });
        acknowledge(callback, { ok: false, error: "Unable to join chat" });
      }
    });

    const emitTypingStatus = async (payload, event) => {
      const chatId = typeof payload === "string" ? payload : payload?.chatId;
      if (!isValidConversationId(chatId)) return;

      try {
        const chat = await isConversationMember(chatId, userId);
        if (!chat) return;
        socket.to(`chat:${chatId}`).emit(event, { chatId, senderId: userId });
      } catch {
        // Silently reject unavailable or unauthorized conversation checks.
      }
    };

    socket.on("userTyping", (payload) => emitTypingStatus(payload, "userTyping"));
    socket.on("userStopTyping", (payload) =>
      emitTypingStatus(payload, "userStopTyping")
    );

    // Socket event is relay-only; REST remains the single persistence path.
    socket.on("sendMessage", async (payload, callback) => {
      const chatId = typeof payload?.chatId === "string" ? payload.chatId : "";
      const text = typeof payload?.text === "string" ? payload.text.trim() : "";
      if (!isValidConversationId(chatId) || !text || text.length > 5000) {
        acknowledge(callback, { ok: false, error: "Invalid message" });
        return;
      }

      try {
        const isMember = await isConversationMember(chatId, userId);
        if (!isMember) {
          acknowledge(callback, { ok: false, error: "Unable to send message" });
          return;
        }

        io.to(`chat:${chatId}`).emit("receiveMessage", {
          senderId: userId,
          chatId,
          text,
          createdAt: new Date(),
        });
        acknowledge(callback, { ok: true });
      } catch {
        acknowledge(callback, { ok: false, error: "Unable to send message" });
      }
    });

    socket.on("messageRead", (payload = {}) => {
      const senderId = payload.senderId?.toString();
      if (!senderId || !isValidConversationId(senderId)) return;
      io.to(`user:${senderId}`).emit("messageReadConfirmation", {
        receiverId: userId,
      });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      sockets?.delete(socket.id);
      if (sockets?.size === 0) onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};
