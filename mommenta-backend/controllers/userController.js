import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import fs from "fs";
import cloudinary from "../middleware/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params; // 🆔 Use ID from the URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Find user by ID instead of username
    const user = await User.findById(id)
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch user's posts with pagination
    const posts = await Post.find({ user: user._id })
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: user._id });
    const hasMore = skip + limit < totalPosts;

    // Determine if viewing user follows this profile
    let isFollowing = false;
    let isOwner = false;

    if (req.user) {
      // const { id } = req.params; // 🆔 Use ID from the URL
      // console.log(userToFollow._id)

      const currentUser = await User.findById(req.user.id);
      // console.log("11",id)
      // console.log(currentUser)
      if (currentUser) {
        isFollowing = currentUser.following
          .map((f) => f.toString())
          .includes(user._id.toString());

        isOwner = currentUser._id.toString() === user._id.toString();
        // console.log("2", isOwner);
      }
    }

    res.json({
      user,
      posts,
      isFollowing,
      isOwner,
      hasMore,
    });
    // console.log(isOwner)
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// // Follow user
export const followUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id; // Ensure consistent ID
    // console.log(userId)
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (userToFollow._id.equals(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ msg: "Already following this user" });
    }

    // Add follow relationship
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Optional: Create follow notification
    const newNotification = new Notification({
      user: userToFollow._id,
      sender: currentUser._id,
      type: "follow",
      message: `${currentUser.username} started following you.`,
    });
    await newNotification.save();

    return res.json({
      msg: "User followed successfully",
      followerCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
      isFollowing: true,
    });
  } catch (err) {
    console.error("Follow user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(userId);

    if (!userToUnfollow) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (userToUnfollow._id.equals(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot unfollow yourself" });
    }

    // Remove follow relationship
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    return res.json({
      msg: "User unfollowed successfully",
      followerCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (err) {
    console.error("Unfollow user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { username, bio, location } = req.body;
    let updatedData = { username, bio, location };

    // If a new profile picture is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pics",
      });

      updatedData.profilePic = result.secure_url;

      // remove temp file
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
