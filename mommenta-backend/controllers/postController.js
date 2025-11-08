import cloudinary from "../middleware/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import fs from "fs";

// ==============================
// Create a new post
// ==============================
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ msg: "Post must include at least one media item" });
    }

    // Upload files to Cloudinary concurrently
    const uploadPromises = files.map((file) =>
      cloudinary.uploader
        .upload(file.path, {
          resource_type: "auto",
          folder: "mommenta_posts",
        })
        .then((result) => {
          fs.unlinkSync(file.path); // delete local temp file
          return {
            mediaUrl: result.secure_url,
            mediaType: result.resource_type,
            publicId: result.public_id,
          };
        })
    );

    const media = await Promise.all(uploadPromises);
    const hashtags = caption ? caption.match(/#\w+/g) || [] : [];

    const newPost = new Post({
      user: userId,
      caption,
      media,
      hashtags,
    });

    await newPost.save();
    await newPost.populate("user", "username profilePic");

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ==============================
// Get Feed (Followed + Random)
// ==============================
export const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ msg: "User not found" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedIds = [...currentUser.following, currentUser._id];

    const followedPosts = await Post.find({ user: { $in: feedIds } })
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const otherPosts = await Post.find({ user: { $nin: feedIds } })
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Mix posts (followed + random)
    const mixedFeed = [];
    const maxLen = Math.max(followedPosts.length, otherPosts.length);

    for (let i = 0; i < maxLen; i++) {
      if (followedPosts[i]) mixedFeed.push(followedPosts[i]);
      if (i % 3 === 0 && otherPosts.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherPosts.length);
        mixedFeed.push(otherPosts.splice(randomIndex, 1)[0]);
      }
    }

    const totalPosts = await Post.countDocuments({ user: { $in: feedIds } });
    const hasMore = skip + limit < totalPosts;

    res.json({ posts: mixedFeed, hasMore });
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ==============================
// Like or Unlike a Post
// ==============================
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ msg: alreadyLiked ? "Unliked" : "Liked", likes: post.likes.length });
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ==============================
// Comment on a Post
// ==============================
export const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = {
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    await post.populate("comments.user", "username profilePic");

    res.json(post);
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ==============================
// Edit a Post (caption only)
// ==============================
export const editPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    post.caption = caption || post.caption;
    post.hashtags = caption ? caption.match(/#\w+/g) || [] : post.hashtags;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Edit Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ==============================
// Delete a Post (with Cloudinary cleanup)
// ==============================
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Delete media from Cloudinary
    for (const item of post.media) {
      if (item.publicId) {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.mediaType || "image",
        });
      }
    }

    await post.deleteOne();
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
