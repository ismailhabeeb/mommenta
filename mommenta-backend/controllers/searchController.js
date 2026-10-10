import User from "../models/User.js";
import Post from "../models/Post.js";
import { getHiddenPrivateUserIds } from "../utils/privacy.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getQuery = (value) => (typeof value === "string" ? value.trim().slice(0, 100) : "");

export const searchUsers = async (req, res) => {
  try {
    const query = getQuery(req.query.q);

    if (!query) return res.json([]);

    const users = await User.find({
      username: { $regex: escapeRegex(query), $options: "i" }
    }).select("username profilePic bio").limit(20);

    res.json(users);
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const query = getQuery(req.query.q);
    if (!query) return res.json([]);
    const viewer = await User.findById(req.user.id).select("following");
    if (!viewer) return res.status(404).json({ msg: "User not found" });
    const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
      viewer._id,
      viewer.following
    );
    const posts = await Post.find({
      caption: { $regex: escapeRegex(query), $options: "i" },
      user: { $nin: hiddenPrivateUserIds },
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (err) {
    console.error("Search posts error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const searchHashtags = async (req, res) => {
  try {
    const query = getQuery(req.query.q).replace(/^#/, "");
    if (!query) return res.json([]);
    const viewer = await User.findById(req.user.id).select("following");
    if (!viewer) return res.status(404).json({ msg: "User not found" });
    const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
      viewer._id,
      viewer.following
    );
    const hashtags = await Post.aggregate([
      { $match: { user: { $nin: hiddenPrivateUserIds } } },
      { $unwind: "$hashtags" },
      { $match: { hashtags: { $regex: escapeRegex(query), $options: "i" } } },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 },
    ]);
    res.json(hashtags);
  } catch (err) {
    console.error("Search hashtags error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
