import Message from "../models/Message.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    const newMessage = new Message({
      sender: req.user,
      receiver: receiverId,
      text
    });

    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get conversation between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user, receiver: userId },
        { sender: userId, receiver: req.user }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark conversation messages as read
export const markMessagesRead = async (req, res) => {
    try {
      const { userId } = req.params;
  
      await Message.updateMany(
        { sender: userId, receiver: req.user, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
  
      res.json({ msg: "Messages marked as read" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };