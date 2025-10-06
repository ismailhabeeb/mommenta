import express from "express";
import { savePost, unsavePost, getSavedPosts } from "../controllers/saveController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:postId", authMiddleware, savePost);       // save a post
router.delete("/:postId", authMiddleware, unsavePost);   // unsave a post
router.get("/", authMiddleware, getSavedPosts);          // get saved posts

export default router;
