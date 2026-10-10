import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Update profile info
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio, profilePic },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    console.error("Settings profile update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (typeof oldPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ msg: "A current password and a new password of at least 6 characters are required" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Toggle privacy
export const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.isPrivate = !user.isPrivate;
    await user.save();

    res.json({
      msg: `Account is now ${user.isPrivate ? "Private" : "Public"}`,
      isPrivate: user.isPrivate,
    });
  } catch (err) {
    console.error("Update privacy error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
