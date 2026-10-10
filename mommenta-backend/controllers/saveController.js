import User from "../models/User.js";
import Post from "../models/Post.js";
import { canViewUserContent } from "../utils/privacy.js";

// Save post
export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (!(await canViewUserContent(req.user.id, post.user))) {
      return res.status(403).json({ msg: "This post is private" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.savedPosts.some((id) => id.toString() === postId)) {
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

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
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
    const user = await User.findById(req.user.id).populate({
      path: "savedPosts",
      populate: { path: "user", select: "username profilePic" }
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const visiblePosts = await Promise.all(
      user.savedPosts.map(async (post) =>
        post && (await canViewUserContent(req.user.id, post.user?._id)) ? post : null
      )
    );
    res.json(visiblePosts.filter(Boolean));
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
