import express from "express";
import { getTrendingHashtags, getPopularPosts } from "../controllers/exploreController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Trending hashtags
router.get("/hashtags", authMiddleware, getTrendingHashtags);

// Popular posts
router.get("/posts", authMiddleware, getPopularPosts);

export default router;
