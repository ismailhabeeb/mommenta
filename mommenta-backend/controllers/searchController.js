import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q; // example: /api/search?q=john

    if (!query) return res.json([]);

    // Case-insensitive search
    const users = await User.find({
      username: { $regex: query, $options: "i" }
    }).select("username profilePic bio");

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
