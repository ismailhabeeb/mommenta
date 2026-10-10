import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import cloudinary from "../middleware/cloudinary.js";
import { removeTempFile } from "../utils/files.js";

const getChatAccess = async (chatId, userId) => {
  if (!mongoose.isValidObjectId(chatId)) {
    return { status: 400, message: "Invalid chat ID" };
  }

  const chat = await Chat.findById(chatId);
  if (!chat) return { status: 404, message: "Chat not found" };
  if (!chat.members.some((member) => member.equals(userId))) {
    return { status: 403, message: "You do not have access to this chat" };
  }

  return { chat };
};

export const requireChatMember = async (req, res, next) => {
  try {
    const access = await getChatAccess(req.params.chatId, req.user.id);
    if (access.status) {
      return res.status(access.status).json({ message: access.message });
    }
    req.chat = access.chat;
    next();
  } catch (error) {
    next(error);
  }
};

// ✅ Start a new conversation or return existing one
export const startConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId.toString() === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot start a chat with yourself" });
    }

    // Check if user exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      members: { $all: [currentUserId, userId] },
    })
      .populate("members", "username profilePic")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username profilePic" },
      });

    if (!chat) {
      chat = await Chat.create({
        members: [currentUserId, userId],
      });

      // Populate again so frontend gets full data
      chat = await Chat.findById(chat._id)
        .populate("members", "username profilePic")
        .populate("lastMessage");
    }

    res.status(201).json(chat);
  } catch (error) {
    console.error("Start conversation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all user’s conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    // const userId2 = req.user;
    // console.log("👉 DEBUG IDs:", { userId2});

    const chats = await Chat.find({ members: userId })
      .populate("members", "username profilePic")
      .populate({
        path: "lastMessage",
        select: "text createdAt sender",
        populate: { path: "sender", select: "username profilePic" },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get all messages in a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const access = await getChatAccess(chatId, req.user.id);
    if (access.status) {
      return res.status(access.status).json({ message: access.message });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePic");
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const senderId = req.user.id;
    const files = req.files || [];
    if (text.length > 5000) {
      await Promise.all(files.map((file) => removeTempFile(file.path)));
      return res.status(400).json({ message: "Message text must be 5000 characters or fewer" });
    }
    let chat = req.chat;
    if (!chat) {
      const access = await getChatAccess(chatId, senderId);
      if (access.status) {
        return res.status(access.status).json({ message: access.message });
      }
      chat = access.chat;
    }

    if (!text && !files.length) {
      return res.status(400).json({ message: "A message or attachment is required" });
    }
    let media = [];

    if (files.length > 0) {
      // Upload files to Cloudinary concurrently
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "auto",  // auto supports video, pdf, docs, images
            folder: "mommenta_messages",
          });
          return {
            mediaUrl: result.secure_url,
            mediaType: result.resource_type,
            publicId: result.public_id,
          };
        } finally {
          await removeTempFile(file.path);
        }
      });

      media = await Promise.all(uploadPromises); // <-- FIX 2: assign to global media
    }

    const message = await Message.create({
      chatId,
      sender: senderId,
      text,
      media,
    });

    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await message.populate(
      "sender",
      "username profilePic"
    );

    // Real-time socket emission
    const io = req.app.get("io");

    const receiverId = chat.members.find((member) => !member.equals(senderId));
    if (receiverId && io) {
      io.to(`user:${receiverId}`).emit("receiveMessage", populatedMessage.toObject());
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Mark messages as read
export const markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const access = await getChatAccess(chatId, userId);
    if (access.status) {
      return res.status(access.status).json({ message: access.message });
    }

    await Message.updateMany(
      { chatId, sender: { $ne: userId }, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
