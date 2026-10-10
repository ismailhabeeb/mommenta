import express from "express";
import {
  createStory,
  deleteStory,
  getStories,
  getStoryViewers,
  getUserStories,
  markViewed,
  replyToStory,
} from "../controllers/storyController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm", ".m4v"]);
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
    const supportedImage = file.mimetype.startsWith("image/") && imageExtensions.has(extension);
    const supportedVideo = file.mimetype.startsWith("video/") && videoExtensions.has(extension);
    if (!supportedImage && !supportedVideo) {
      const error = new Error("Stories must be a supported image or video file");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

router.post("/", authMiddleware, upload.single("media"), createStory);
router.get("/", authMiddleware, getStories);
router.get("/user/:userId", authMiddleware, getUserStories);
router.get("/:storyId/viewers", authMiddleware, getStoryViewers);
router.post("/:storyId/reply", authMiddleware, replyToStory);
router.post("/:storyId/view", authMiddleware, markViewed); // mark as viewed
router.delete("/:storyId", authMiddleware, deleteStory);

export default router;
