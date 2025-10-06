import cloudinary from "../middleware/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import fs from "fs";
// import cloudinary from "../utils/cloudinary.js";
// import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user.id; // from auth middleware
    const files = req.files || [];

    if (!files.length) {
      return res
        .status(400)
        .json({ msg: "Post must include at least one media item" });
    }

    let media = [];

    // Upload all files (image/video) to Cloudinary
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto", // auto detects image or video
        folder: "mommenta_posts",
      });
      
      media.push({
        mediaUrl: result.secure_url,
        mediaType: result.resource_type, // "image" or "video"
      });
      // remove temp file
      fs.unlinkSync(req.file.path);
    }

    // Extract hashtags from caption
    const hashtags = caption ? caption.match(/#\w+/g) || [] : [];

    const newPost = new Post({
      user: userId,
      caption,
      media, // now properly structured
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

// Get all posts (feed)
export const getFeed = async (req, res) => {
  try {
    // console.log(req, "mahish")
    const currentUser = await User.findById(req.user.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // IDs of people the user follows + self
    const feedIds = [...currentUser.following, currentUser._id];

    // Fetch posts from followed + self
    const followedPosts = await Post.find({ user: { $in: feedIds } })
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch posts from *other* users (for variety)
    const otherPosts = await Post.find({ user: { $nin: feedIds } })
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Mix them randomly
    const mixedFeed = [];
    const maxLen = Math.max(followedPosts.length, otherPosts.length);

    for (let i = 0; i < maxLen; i++) {
      if (followedPosts[i]) mixedFeed.push(followedPosts[i]);
      if (i % 3 === 0 && otherPosts.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherPosts.length);
        mixedFeed.push(otherPosts.splice(randomIndex, 1)[0]);
      }
    }

    // Check if there are more posts for pagination
    const totalPosts = await Post.countDocuments();
    const hasMore = skip + limit < totalPosts;

    res.json({ posts: mixedFeed, hasMore });
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// Like or unlike post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.likes.includes(req.user)) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user);
    } else {
      post.likes.push(req.user);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Comment on a post
export const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = {
      user: req.user,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
