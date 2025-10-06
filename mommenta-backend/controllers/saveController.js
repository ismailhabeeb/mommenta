import User from "../models/User.js";
import Post from "../models/Post.js";

// Save post
export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const user = await User.findById(req.user);

    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    res.json({ msg: "Post saved" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Unsave post
export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const user = await User.findById(req.user);
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    await user.save();

    res.json({ msg: "Post unsaved" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all saved posts
export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate({
      path: "savedPosts",
      populate: { path: "user", select: "username profilePic" }
    });

    res.json(user.savedPosts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
