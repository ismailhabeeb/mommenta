import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Update profile info
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { username, bio, profilePic },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Toggle privacy
export const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    user.isPrivate = !user.isPrivate;
    await user.save();

    res.json({ msg: `Account is now ${user.isPrivate ? "Private" : "Public"}` });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user);
    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
