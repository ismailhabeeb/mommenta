import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import fs from "fs";
import cloudinary from "../middleware/cloudinary.js";
import { canViewUserContent } from "../utils/privacy.js";

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params; // 🆔 Use ID from the URL
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 9));
    const skip = (page - 1) * limit;

    // Find user by ID instead of username
    const user = await User.findById(id)
      .select("-password -email -isAdmin -isBanned -followRequests -savedPosts");

    if (!user) return res.status(404).json({ message: "User not found" });

    const viewer = await User.findById(req.user.id).select("following");
    const isOwner = viewer?._id.equals(user._id) || false;
    const isFollowing = viewer?.following.some((followedId) => followedId.equals(user._id)) || false;
    const isPending = Boolean(
      await User.exists({ _id: user._id, followRequests: req.user.id })
    );
    const canViewProfileContent = !user.isPrivate || isOwner || isFollowing;
    const followerCount = user.followers.length;
    const followingCount = user.following.length;

    if (canViewProfileContent) {
      await user.populate([
        { path: "followers", select: "username profilePic" },
        { path: "following", select: "username profilePic" },
      ]);
    } else {
      user.followers = [];
      user.following = [];
    }

    const posts = canViewProfileContent
      ? await Post.find({ user: user._id })
          .populate("user", "username profilePic")
          .populate("comments.user", "username profilePic")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      : [];
    const totalPosts = await Post.countDocuments({ user: user._id });

    res.json({
      user,
      posts,
      isFollowing,
      isOwner,
      isPending,
      isPrivate: user.isPrivate,
      followerCount,
      followingCount,
      postsCount: totalPosts,
      hasMore: canViewProfileContent && skip + limit < totalPosts,
    });
    // console.log(isOwner)
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    if (!(await canViewUserContent(req.user.id, req.params.id))) {
      return res.status(403).json({ msg: "This account's followers are private" });
    }
    const user = await User.findById(req.params.id)
      .select("followers")
      .populate("followers", "username profilePic");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.followers);
  } catch (err) {
    console.error("Get followers error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    if (!(await canViewUserContent(req.user.id, req.params.id))) {
      return res.status(403).json({ msg: "This account's following list is private" });
    }
    const user = await User.findById(req.params.id)
      .select("following")
      .populate("following", "username profilePic");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.following);
  } catch (err) {
    console.error("Get following error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// // Follow user
export const followUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id; // Ensure consistent ID
    // console.log(userId)
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (userToFollow._id.equals(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    // Check if already following
    if (currentUser.following.some((id) => id.equals(userToFollow._id))) {
      return res.status(400).json({ msg: "Already following this user" });
    }

    if (userToFollow.isPrivate) {
      if (userToFollow.followRequests.some((id) => id.equals(currentUser._id))) {
        return res.status(409).json({ msg: "Follow request is already pending", isPending: true });
      }
      userToFollow.followRequests.push(currentUser._id);
      await userToFollow.save();
      const notification = await Notification.create({
        user: userToFollow._id,
        sender: currentUser._id,
        type: "followRequest",
      });
      await notification.populate("sender", "username profilePic");
      req.app.get("io")?.to(`user:${userToFollow._id}`).emit("newNotification", notification);
      return res.status(202).json({ msg: "Follow request sent", isFollowing: false, isPending: true });
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
    });
    await newNotification.save();
    await newNotification.populate("sender", "username profilePic");
    req.app.get("io")?.to(`user:${userToFollow._id}`).emit("newNotification", newNotification);

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

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (userToUnfollow._id.equals(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot unfollow yourself" });
    }

    const wasPending = userToUnfollow.followRequests.some((id) => id.equals(currentUser._id));
    if (wasPending) {
      userToUnfollow.followRequests = userToUnfollow.followRequests.filter(
        (id) => !id.equals(currentUser._id)
      );
      await userToUnfollow.save();
      await Notification.deleteOne({
        user: userToUnfollow._id,
        sender: currentUser._id,
        type: "followRequest",
      });
      return res.json({ msg: "Follow request cancelled", isFollowing: false, isPending: false });
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

export const getFollowRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("followRequests")
      .populate("followRequests", "username profilePic bio");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.followRequests);
  } catch (err) {
    console.error("Get follow requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id);
    const requester = await User.findById(req.params.requesterId);
    if (!owner || !requester) return res.status(404).json({ msg: "User not found" });
    if (!owner.followRequests.some((id) => id.equals(requester._id))) {
      return res.status(404).json({ msg: "Follow request not found" });
    }

    owner.followRequests = owner.followRequests.filter((id) => !id.equals(requester._id));
    if (!owner.followers.some((id) => id.equals(requester._id))) {
      owner.followers.push(requester._id);
    }
    if (!requester.following.some((id) => id.equals(owner._id))) {
      requester.following.push(owner._id);
    }
    await Promise.all([owner.save(), requester.save()]);
    await Notification.deleteOne({
      user: owner._id,
      sender: requester._id,
      type: "followRequest",
    });
    const notification = await Notification.create({
      user: requester._id,
      sender: owner._id,
      type: "follow",
    });
    await notification.populate("sender", "username profilePic");
    req.app.get("io")?.to(`user:${requester._id}`).emit("newNotification", notification);
    res.json({ msg: "Follow request accepted" });
  } catch (err) {
    console.error("Accept follow request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const declineFollowRequest = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id);
    if (!owner) return res.status(404).json({ msg: "User not found" });
    const requestExists = owner.followRequests.some(
      (id) => id.toString() === req.params.requesterId
    );
    if (!requestExists) return res.status(404).json({ msg: "Follow request not found" });
    owner.followRequests = owner.followRequests.filter(
      (id) => id.toString() !== req.params.requesterId
    );
    await owner.save();
    await Notification.deleteOne({
      user: owner._id,
      sender: req.params.requesterId,
      type: "followRequest",
    });
    res.json({ msg: "Follow request declined" });
  } catch (err) {
    console.error("Decline follow request error:", err);
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
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile_pics",
          });
          updatedData.profilePic = result.secure_url;
        } finally {
          await fs.promises.unlink(req.file.path);
        }
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
