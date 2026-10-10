import express from "express";
import {
  searchHashtags,
  searchPosts,
  searchUsers,
} from "../controllers/searchController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, searchUsers);
router.get("/users", authMiddleware, searchUsers);
router.get("/posts", authMiddleware, searchPosts);
router.get("/hashtags", authMiddleware, searchHashtags);

export default router;
