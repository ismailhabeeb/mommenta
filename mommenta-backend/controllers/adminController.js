import User from "../models/User.js";
import Post from "../models/Post.js";
import Report from "../models/Report.js";

// Report a post
export const reportPost = async (req, res) => {
  try {
    const { postId, reason } = req.body;

    const newReport = new Report({
      post: postId,
      reportedBy: req.user,
      reason
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
      .populate("post", "caption image")
      .populate("reportedBy", "username");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Admin: remove post
export const removePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
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
