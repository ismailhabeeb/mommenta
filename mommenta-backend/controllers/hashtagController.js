import Post from "../models/Post.js";

export const getPostsByHashtag = async (req, res) => {
  try {
    const hashtag = req.params.tag;

    const posts = await Post.find({ hashtags: hashtag })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
