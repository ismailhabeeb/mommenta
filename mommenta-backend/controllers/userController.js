import User from "../models/User.js";
import Notification from "../models/Notification.js";
import fs from "fs";
import cloudinary from "../middleware/cloudinary.js";

// Follow user
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user);

    if (!userToFollow) return res.status(404).json({ msg: "User not found" });
    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    
      await currentUser.save();
      await userToFollow.save();
    
      // Create notification
      const newNotification = new Notification({
        user: userToFollow._id,
        sender: currentUser._id,
        type: "follow"
      });
      await newNotification.save();
    }

    res.json({ msg: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user);

    if (!userToUnfollow) return res.status(404).json({ msg: "User not found" });

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ msg: "User unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic");
    
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const {username, bio, location, } = req.body;
    let updatedData = {username, bio, location };

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

  

 