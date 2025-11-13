import { Server } from "socket.io";

export const initSocket = (server, app) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://mommenta.vercel.app"
    // process.env.FRONTEND_URL
  ];
  // const io = new Server(server, {
  //   cors: {
  //     origin: process.env.FRONTEND_URL || "http://localhost:5173",
  //     credentials: true,
  //   },
  // });

  const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  },
});

  const onlineUsers = new Map();

  // Store socket + users globally (for controllers)
  app.set("io", io);
  app.set("onlineUsers", onlineUsers);

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // User joins after login
    socket.on("join", (userId) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      console.log("✅ Online users:", Array.from(onlineUsers.keys()));
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // Join private chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`🗨️ ${socket.id} joined chat ${chatId}`);
    });

    // Send message (1-to-1)
    socket.on("sendMessage", ({ senderId, receiverId, text, chatId }) => {
      const receiverSocket = onlineUsers.get(receiverId);

      if (chatId) {
        io.to(chatId).emit("receiveMessage", {
          senderId,
          text,
          createdAt: new Date(),
        });
      } else if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", {
          senderId,
          text,
          createdAt: new Date(),
        });
      }
      // typing

      socket.on("typing", ({ chatId, senderId, receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit("userTyping", { chatId, senderId });
        }
      });
      socket.on("stopTyping", ({ chatId, senderId, receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit("userStopTyping", { chatId, senderId });
        }
      });
    });

    // Mark message as read
    socket.on("messageRead", ({ senderId, receiverId }) => {
      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("messageReadConfirmation", { receiverId });
      }
    });

    // Real-time notification
    socket.on("sendNotification", ({ receiverId, notification }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("newNotification", notification);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};
