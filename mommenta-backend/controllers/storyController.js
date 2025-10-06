import Story from "../models/Story.js";

export const createStory = async (req, res) => {
  try {
    const { mediaUrl, type } = req.body;

    const newStory = new Story({
      user: req.user,
      mediaUrl,
      type,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hrs
    });

    await newStory.save();
    res.json(newStory);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
export const getStories = async (req, res) => {
    try {
      const stories = await Story.find({ expiresAt: { $gt: new Date() } })
        .populate("user", "username profilePic")
        .sort({ createdAt: -1 });
  
      res.json(stories);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  export const markViewed = async (req, res) => {
    try {
      const { storyId } = req.params;
  
      const story = await Story.findById(storyId);
      if (!story) return res.status(404).json({ msg: "Story not found" });
  
      if (!story.viewers.includes(req.user)) {
        story.viewers.push(req.user);
        await story.save();
      }
  
      res.json({ msg: "Viewed" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
    