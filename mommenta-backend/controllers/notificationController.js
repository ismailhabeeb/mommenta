import Notification from "../models/Notification.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user })
      .populate("sender", "username profilePic")
      .populate("post", "image caption")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ msg: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
