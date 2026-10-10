import Notification from "../models/Notification.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("sender", "username profilePic")
      .populate("post", "media caption")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ msg: "Notification not found" });
    res.json(notification);
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ msg: "Notifications marked as read" });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ msg: "Notifications cleared" });
  } catch (err) {
    console.error("Clear notifications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
