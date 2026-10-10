import User from "../models/User.js";
import Post from "../models/Post.js";
import Report from "../models/Report.js";
import cloudinary from "../middleware/cloudinary.js";

// Report a post
export const reportPost = async (req, res) => {
  try {
    const { postId, reason } = req.body;
    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ msg: "A report reason is required" });
    }
    const post = await Post.findById(postId).select("_id");
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const newReport = new Report({
      post: postId,
      reportedBy: req.user.id,
      reason: reason.trim().slice(0, 1000)
    });

    await newReport.save();
    res.json({ msg: "Report submitted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("post", "caption media")
      .populate("reportedBy", "username");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("username email profilePic isAdmin isBanned createdAt")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(users);
  } catch (err) {
    console.error("Get admin users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posts);
  } catch (err) {
    console.error("Get admin posts error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: remove post
export const removePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    for (const item of post.media) {
      if (item.publicId) {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.mediaType || "image",
        });
      }
    }
    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: ban user
export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isBanned = true;
    await user.save();

    res.json({ msg: "User banned" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: unban user
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isBanned = false;
    await user.save();

    res.json({ msg: "User unbanned" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
