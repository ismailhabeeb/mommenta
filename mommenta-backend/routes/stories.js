import express from "express";
import { createStory, getStories, markViewed } from "../controllers/storyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createStory);   // add story
router.get("/", authMiddleware, getStories);     // fetch active stories
router.post("/:storyId/view", authMiddleware, markViewed); // mark as viewed

export default router;
