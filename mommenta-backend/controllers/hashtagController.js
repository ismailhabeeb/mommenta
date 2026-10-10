import Post from "../models/Post.js";
import User from "../models/User.js";
import { getHiddenPrivateUserIds } from "../utils/privacy.js";

export const getPostsByHashtag = async (req, res) => {
  try {
    const hashtag = req.params.tag;
    const viewer = await User.findById(req.user.id).select("following");
    if (!viewer) return res.status(404).json({ msg: "User not found" });
    const hiddenPrivateUserIds = await getHiddenPrivateUserIds(
      viewer._id,
      viewer.following
    );

    const posts = await Post.find({
      hashtags: hashtag,
      user: { $nin: hiddenPrivateUserIds },
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
