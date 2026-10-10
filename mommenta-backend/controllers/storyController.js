import mongoose from "mongoose";
import Story from "../models/Story.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../middleware/cloudinary.js";
import { canViewUserContent, getHiddenPrivateUserIds } from "../utils/privacy.js";
import { removeTempFile } from "../utils/files.js";

const ACTIVE_STORY = () => ({ expiresAt: { $gt: new Date() } });
const isValidId = (id) => mongoose.isValidObjectId(id);

const serializeStory = (story, viewerId, ownerId) => {
  const viewer = viewerId.toString();
  const owner = ownerId.toString();
  const viewers = story.viewers || [];
  const viewRecords = story.viewRecords || [];
  const viewedBy = viewers.some((id) => id.toString() === viewer)
    || viewRecords.some((record) => record.user.toString() === viewer);
  return {
    _id: story._id,
    mediaUrl: story.mediaUrl,
    type: story.type,
    caption: story.caption,
    createdAt: story.createdAt,
    expiresAt: story.expiresAt,
    viewed: viewer === owner ? false : viewedBy,
    ...(viewer === owner ? { viewCount: new Set([
        ...viewers.map((id) => id.toString()),
        ...viewRecords.map((record) => record.user.toString()),
    ].filter((id) => id !== owner)).size } : {}),
  };
};

const removeStoryAsset = async (publicId, type) => {
  if (!publicId || !publicId.startsWith("mommenta_stories/")) return;
  await cloudinary.uploader.destroy(publicId, {
    resource_type: type === "video" ? "video" : "image",
  });
};

const loadActiveStory = async (storyId) => {
  if (!isValidId(storyId)) return null;
  return Story.findOne({ _id: storyId, ...ACTIVE_STORY() })
    .select("+publicId")
    .populate("user", "username fullName profilePic");
};

export const createStory = async (req, res) => {
  let uploadedAsset;
  let createdStory;
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Choose an image or video for your story" });
    }
    const caption = typeof req.body.caption === "string" ? req.body.caption.trim() : "";
    if (caption.length > 500) {
      return res.status(400).json({ msg: "Story caption must be 500 characters or fewer" });
    }

    const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
    uploadedAsset = await cloudinary.uploader.upload(req.file.path, {
      resource_type: type,
      folder: "mommenta_stories",
      overwrite: false,
    });
    if (!uploadedAsset.secure_url || uploadedAsset.resource_type !== type) {
      await removeStoryAsset(uploadedAsset.public_id, uploadedAsset.resource_type);
      return res.status(400).json({ msg: "The uploaded file could not be verified as story media" });
    }

    createdStory = await Story.create({
      user: req.user.id,
      mediaUrl: uploadedAsset.secure_url,
      publicId: uploadedAsset.public_id,
      type,
      caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await createdStory.populate("user", "username fullName profilePic");
    return res.status(201).json({
      story: serializeStory(createdStory, req.user.id, req.user.id),
      user: createdStory.user,
    });
  } catch (error) {
    console.error("Create story error:", error);
    if (createdStory) {
      try {
        await createdStory.deleteOne();
      } catch (cleanupError) {
        console.error("Failed to remove incomplete story record:", cleanupError);
      }
    }
    if (uploadedAsset?.public_id) {
      try {
        await removeStoryAsset(uploadedAsset.public_id, uploadedAsset.resource_type);
      } catch (cleanupError) {
        console.error("Story upload cleanup failed:", cleanupError);
      }
    }
    return res.status(500).json({ msg: "Unable to create story" });
  } finally {
    try {
      await removeTempFile(req.file?.path);
    } catch (cleanupError) {
      console.error("Story temporary upload cleanup failed:", cleanupError);
    }
  }
};

export const getStories = async (req, res) => {
  try {
    const viewer = await User.findById(req.user.id).select("following");
    if (!viewer) return res.status(404).json({ msg: "User not found" });
    const hiddenPrivateUserIds = await getHiddenPrivateUserIds(viewer._id, viewer.following);
    const now = new Date();
    const [ownStories, otherStories] = await Promise.all([
      Story.find({ user: viewer._id, expiresAt: { $gt: now } })
        .populate("user", "username fullName profilePic")
        .sort({ createdAt: -1, _id: -1 })
        .limit(100),
      Story.find({
        expiresAt: { $gt: now },
        user: { $nin: [...hiddenPrivateUserIds, viewer._id] },
      })
        .populate("user", "username fullName profilePic")
        .sort({ createdAt: -1, _id: -1 })
        .limit(500),
    ]);
    const stories = [...ownStories, ...otherStories]
      .filter((story) => story.user)
      .sort((left, right) => right.createdAt - left.createdAt);

    const groupsByAuthor = new Map();
    for (const story of stories) {
      const ownerId = story.user._id.toString();
      if (!groupsByAuthor.has(ownerId)) {
        groupsByAuthor.set(ownerId, {
          user: story.user,
          stories: [],
          hasUnviewed: false,
          latestCreatedAt: story.createdAt,
        });
      }
      const group = groupsByAuthor.get(ownerId);
      const serialized = serializeStory(story, viewer._id, story.user._id);
      group.stories.unshift(serialized);
      if (ownerId !== viewer._id.toString() && !serialized.viewed) group.hasUnviewed = true;
    }

    const groups = [...groupsByAuthor.values()].sort((left, right) => {
      const leftOwn = left.user._id.equals(viewer._id);
      const rightOwn = right.user._id.equals(viewer._id);
      if (leftOwn !== rightOwn) return leftOwn ? -1 : 1;
      if (left.hasUnviewed !== right.hasUnviewed) return left.hasUnviewed ? -1 : 1;
      return right.latestCreatedAt - left.latestCreatedAt;
    }).slice(0, 50);

    return res.json(groups);
  } catch (error) {
    console.error("Get stories error:", error);
    return res.status(500).json({ msg: "Unable to load stories" });
  }
};

export const getUserStories = async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) return res.status(400).json({ msg: "Invalid user ID" });
    const owner = await User.findById(req.params.userId).select("username fullName profilePic");
    if (!owner) return res.status(404).json({ msg: "User not found" });
    if (!(await canViewUserContent(req.user.id, owner._id))) {
      return res.status(403).json({ msg: "This account's stories are private" });
    }
    const stories = await Story.find({ user: owner._id, ...ACTIVE_STORY() })
      .sort({ createdAt: -1, _id: -1 })
      .limit(100);
    return res.json(stories.reverse().map((story) => ({
      ...serializeStory(story, req.user.id, owner._id),
      user: owner,
    })));
  } catch (error) {
    console.error("Get user stories error:", error);
    return res.status(500).json({ msg: "Unable to load this user's stories" });
  }
};

export const deleteStory = async (req, res) => {
  try {
    if (!isValidId(req.params.storyId)) return res.status(400).json({ msg: "Invalid story ID" });
    const story = await Story.findById(req.params.storyId).select("+publicId");
    if (!story || story.expiresAt <= new Date()) {
      return res.status(404).json({ msg: "Story not found or expired" });
    }
    if (!story.user.equals(req.user.id)) {
      return res.status(403).json({ msg: "You cannot delete this story" });
    }

    const { publicId, type } = story;
    await story.deleteOne();
    if (publicId?.startsWith("mommenta_stories/")) {
      try {
        await removeStoryAsset(publicId, type);
      } catch (error) {
        console.error("Deleted story media cleanup failed:", error);
        return res.json({
          msg: "Story deleted",
          mediaCleanupPending: true,
        });
      }
    }
    return res.json({ msg: "Story deleted" });
  } catch (error) {
    console.error("Delete story error:", error);
    return res.status(500).json({ msg: "Unable to delete story" });
  }
};

export const getStoryViewers = async (req, res) => {
  try {
    const story = await loadActiveStory(req.params.storyId);
    if (!story) return res.status(404).json({ msg: "Story not found or expired" });
    if (!story.user._id.equals(req.user.id)) {
      return res.status(403).json({ msg: "Only the story owner can view its viewers" });
    }

    const records = await Story.findById(story._id)
      .select("viewers viewRecords")
      .populate("viewers", "username fullName profilePic")
      .populate("viewRecords.user", "username fullName profilePic")
      .lean();
    if (!records) return res.status(404).json({ msg: "Story not found or expired" });
    const detailsById = new Map((records.viewRecords || []).filter((record) => record.user).map((record) => [
      record.user._id.toString(),
      { user: record.user, viewedAt: record.viewedAt },
    ]));
    const viewers = (records.viewers || [])
      .filter((user) => user && !user._id.equals(story.user._id))
      .map((user) => detailsById.get(user._id.toString()) || { user, viewedAt: null });
    return res.json(viewers);
  } catch (error) {
    console.error("Get story viewers error:", error);
    return res.status(500).json({ msg: "Unable to load story viewers" });
  }
};

export const replyToStory = async (req, res) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text || text.length > 1000) {
      return res.status(400).json({ msg: "Reply must contain 1 to 1000 characters" });
    }
    const story = await loadActiveStory(req.params.storyId);
    if (!story) return res.status(404).json({ msg: "Story not found or expired" });
    if (!(await canViewUserContent(req.user.id, story.user._id))) {
      return res.status(403).json({ msg: "This story is private" });
    }
    if (story.user._id.equals(req.user.id)) {
      return res.status(400).json({ msg: "You cannot reply to your own story" });
    }

    let chat = await Chat.findOne({ members: { $all: [req.user.id, story.user._id] } });
    if (!chat) chat = await Chat.create({ members: [req.user.id, story.user._id] });
    const message = await Message.create({
      chatId: chat._id,
      sender: req.user.id,
      text,
      media: [],
    });
    chat.lastMessage = message._id;
    await chat.save();
    const populatedMessage = await message.populate("sender", "username profilePic");
    req.app.get("io")?.to(`user:${story.user._id}`).emit(
      "receiveMessage",
      populatedMessage.toObject()
    );
    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Reply to story error:", error);
    return res.status(500).json({ msg: "Unable to reply to story" });
  }
};

export const markViewed = async (req, res) => {
  try {
    if (!isValidId(req.params.storyId)) return res.status(400).json({ msg: "Invalid story ID" });
    const now = new Date();
    const story = await Story.findOne({
      _id: req.params.storyId,
      ...ACTIVE_STORY(),
    }).select("user viewers");
    if (!story) return res.status(404).json({ msg: "Story not found or expired" });
    if (!(await canViewUserContent(req.user.id, story.user))) {
      return res.status(403).json({ msg: "This story is private" });
    }
    if (story.user.equals(req.user.id)) return res.json({ msg: "Own story view not recorded" });

    const updated = await Story.findOneAndUpdate(
      {
        _id: story._id,
        ...ACTIVE_STORY(),
        viewRecords: { $not: { $elemMatch: { user: req.user.id } } },
      },
      {
        $addToSet: { viewers: req.user.id },
        $push: { viewRecords: { user: req.user.id, viewedAt: now } },
      },
      { new: true, projection: { _id: 1 } }
    );
    if (!updated) {
      await Story.updateOne(
        { _id: story._id, ...ACTIVE_STORY(), "viewRecords.user": req.user.id },
        { $set: { "viewRecords.$.viewedAt": now }, $addToSet: { viewers: req.user.id } }
      );
      await Story.updateOne(
        {
          _id: story._id,
          ...ACTIVE_STORY(),
          viewRecords: { $not: { $elemMatch: { user: req.user.id } } },
        },
        {
          $addToSet: { viewers: req.user.id },
          $push: { viewRecords: { user: req.user.id, viewedAt: now } },
        }
      );
    }
    return res.json({ msg: "Viewed" });
  } catch (error) {
    console.error("Mark story viewed error:", error);
    return res.status(500).json({ msg: "Unable to record story view" });
  }
};
