import Post from "../models/Post.js";

// Trending Hashtags
export const getTrendingHashtags = async (req, res) => {
  try {
    const hashtags = await Post.aggregate([
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
  
      const posts = await Post.find({ createdAt: { $gte: oneWeekAgo } })
        .populate("user", "username profilePic")
        .sort({ "likes.length": -1 }) // sort by number of likes
        .limit(20);
  
      res.json(posts);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  