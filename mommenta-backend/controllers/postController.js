import cloudinary from "../middleware/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { canViewUserContent, getHiddenPrivateUserIds } from "../utils/privacy.js";
import { removeTempFile } from "../utils/files.js";

// ==============================
// Create a new post
// ==============================
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    if (typeof caption === "string" && caption.length > 2200) {
      await Promise.all(files.map((file) => removeTempFile(file.path)));
      return res.status(400).json({ msg: "Caption must be 2200 characters or fewer" });
    }
    if (!files.length) {
      return res.status(400).json({ msg: "Post must include at least one media item" });
    }

    // Upload files to Cloudinary concurrently
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "mommenta_posts",
        });
        return {
          mediaUrl: result.secure_url,
          mediaType: result.resource_type,
          publicId: result.public_id,
        };
      } finally {
        await removeTempFile(file.path);
      }
    });

    const media = await Promise.all(uploadPromises);
    const hashtags = caption ? caption.match(/#\w+/g) || [] : [];

    const newPost = new Post({
      user: userId,
      caption: typeof caption === "string" ? caption.trim() : "",
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
// Paginate followed posts and public discovery posts as two stable streams.
// ==============================
export const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ msg: "User not found" });

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const feedIds = [...currentUser.following, currentUser._id];
    const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
      currentUser._id,
      currentUser.following
    );
    const otherFeedIds = [...feedIds, ...hiddenPrivateUserIds];
    const otherLimit = Math.ceil(limit / 3);
    const otherSkip = (page - 1) * otherLimit;

    const [followedPosts, otherPosts, followedCount, otherCount] = await Promise.all([
      Post.find({ user: { $in: feedIds } })
        .populate("user", "username profilePic")
        .populate("comments.user", "username profilePic")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),
      Post.find({ user: { $nin: otherFeedIds } })
        .populate("user", "username profilePic")
        .populate("comments.user", "username profilePic")
        .sort({ createdAt: -1, _id: -1 })
        .skip(otherSkip)
        .limit(otherLimit),
      Post.countDocuments({ user: { $in: feedIds } }),
      Post.countDocuments({ user: { $nin: otherFeedIds } }),
    ]);

    const mixedFeed = [];
    const maxLen = Math.max(
      followedPosts.length,
      otherPosts.length ? (otherPosts.length - 1) * 3 + 1 : 0
    );
    let otherIndex = 0;
    for (let i = 0; i < maxLen; i++) {
      if (followedPosts[i]) mixedFeed.push(followedPosts[i]);
      if (i % 3 === 0 && otherPosts[otherIndex]) {
        mixedFeed.push(otherPosts[otherIndex]);
        otherIndex += 1;
      }
    }

    const hasMore =
      skip + limit < followedCount || otherSkip + otherLimit < otherCount;

    res.json({ posts: mixedFeed, hasMore });
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (!(await canViewUserContent(req.user.id, post.user._id))) {
      return res.status(403).json({ msg: "This post is private" });
    }
    res.json(post);
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select("user comments")
      .populate("comments.user", "username profilePic");
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (!(await canViewUserContent(req.user.id, post.user._id))) {
      return res.status(403).json({ msg: "This post is private" });
    }
    res.json(post.comments);
  } catch (err) {
    console.error("Get post comments error:", err);
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
    if (!(await canViewUserContent(req.user.id, post.user))) {
      return res.status(403).json({ msg: "This post is private" });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    if (!alreadyLiked && post.user.toString() !== userId.toString()) {
      const notification = await Notification.create({
        user: post.user,
        sender: userId,
        type: "like",
        post: post._id,
      });
      await notification.populate("sender", "username profilePic");
      req.app.get("io")?.to(`user:${post.user}`).emit("newNotification", notification);
    }
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
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ msg: "Comment cannot be empty" });
    if (text.length > 1000) {
      return res.status(400).json({ msg: "Comment must be 1000 characters or fewer" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (!(await canViewUserContent(req.user.id, post.user))) {
      return res.status(403).json({ msg: "This post is private" });
    }

    const comment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    await post.populate("comments.user", "username profilePic");
    if (post.user.toString() !== req.user.id.toString()) {
      const notification = await Notification.create({
        user: post.user,
        sender: req.user.id,
        type: "comment",
        post: post._id,
      });
      await notification.populate("sender", "username profilePic");
      req.app.get("io")?.to(`user:${post.user}`).emit("newNotification", notification);
    }

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

    if (typeof caption === "string") {
      post.caption = caption.trim();
      post.hashtags = caption.match(/#\w+/g) || [];
    }

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
