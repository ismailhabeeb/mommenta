import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../middleware/cloudinary.js";
import fs from "fs";

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

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const messages = await Message.find({ chatId: chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePic");
    console.log(messages);
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
    const { text } = req.body;
    const senderId = req.user.id;

    let media = []; // <-- FIX 1: declare media globally

    const files = req.files || [];

    if (files.length > 0) {
      // Upload files to Cloudinary concurrently
      const uploadPromises = files.map((file) =>
        cloudinary.uploader
          .upload(file.path, {
            resource_type: "auto",  // auto supports video, pdf, docs, images
            folder: "mommenta_messages",
          })
          .then((result) => {
            fs.unlinkSync(file.path); // delete temp file
            return {
              mediaUrl: result.secure_url,
              mediaType: result.resource_type, // image, video, raw
              publicId: result.public_id,
            };
          })
      );

      media = await Promise.all(uploadPromises); // <-- FIX 2: assign to global media
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Save message
    const message = await Message.create({
      chatId,
      sender: senderId,
      text: text || "",
      media, // <-- now always defined (empty array or filled array)
    });

    // Update last message
    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await message.populate(
      "sender",
      "username profilePic"
    );

    // Real-time socket emission
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const receiverId = chat.members
      .filter(Boolean)
      .map((m) => (m._id ? m._id.toString() : m.toString()))
      .find((id) => id !== senderId.toString());

    const receiverSocket = onlineUsers?.get(receiverId);

    if (receiverSocket && io) {
      io.to(receiverSocket).emit("receiveMessage", {
        _id: message._id,
        chatId,
        senderId,
        text,
        media,
        createdAt: message.createdAt,
      });
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
    const userId = req.user._id;

    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
