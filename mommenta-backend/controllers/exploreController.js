import Post from "../models/Post.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { getHiddenPrivateUserIds } from "../utils/privacy.js";

// Trending Hashtags
export const getTrendingHashtags = async (req, res) => {
  try {
    const viewer = await User.findById(req.user.id).select("following");
    if (!viewer) return res.status(404).json({ msg: "User not found" });
    const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
      viewer._id,
      viewer.following
    );
    const hashtags = await Post.aggregate([
      { $match: { user: { $nin: hiddenPrivateUserIds } } },
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 } // top 10
    ]);

    res.json(hashtags);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Popular Posts (last 7 days)
export const getPopularPosts = async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const viewer = await User.findById(req.user.id).select("following");
      if (!viewer) return res.status(404).json({ msg: "User not found" });
      const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
        viewer._id,
        viewer.following
      );
  
      const posts = await Post.aggregate([
        {
          $match: {
            createdAt: { $gte: oneWeekAgo },
            user: { $nin: hiddenPrivateUserIds },
          },
        },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $limit: 20 },
      ]);
      await Post.populate(posts, { path: "user", select: "username profilePic" });
  
      res.json(posts);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };

  export const getTrendingUsers = async (req, res) => {
    try {
      const users = await User.find({
        _id: { $ne: req.user.id },
        isBanned: { $ne: true },
      })
        .select("username profilePic bio")
        .sort({ createdAt: -1 })
        .limit(10);
      res.json(users);
    } catch (err) {
      console.error("Get trending users error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  };

  export const getTrendingStories = async (req, res) => {
    try {
      const viewer = await User.findById(req.user.id).select("following");
      if (!viewer) return res.status(404).json({ msg: "User not found" });
      const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
        viewer._id,
        viewer.following
      );
      const stories = await Story.find({
        expiresAt: { $gt: new Date() },
        user: { $nin: hiddenPrivateUserIds },
      })
        .populate("user", "username profilePic")
        .select("-viewers -viewRecords -publicId")
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(stories);
    } catch (err) {
      console.error("Get trending stories error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  };
  