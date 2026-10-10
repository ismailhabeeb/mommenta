import express from "express";
import {
  getPopularPosts,
  getTrendingHashtags,
  getTrendingStories,
  getTrendingUsers,
} from "../controllers/exploreController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Trending hashtags
router.get("/hashtags", authMiddleware, getTrendingHashtags);

// Popular posts
router.get("/posts", authMiddleware, getPopularPosts);
router.get("/users", authMiddleware, getTrendingUsers);
router.get("/stories", authMiddleware, getTrendingStories);

export default router;
