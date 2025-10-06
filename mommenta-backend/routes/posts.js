import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { commentOnPost, createPost, getFeed, likePost, } from "../controllers/postController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create a new post
const upload = multer({ dest: "uploads/" }); // temp folder

router.post("/", auth, upload.array("media", 5), createPost);
// router.put("/profile", auth, upload.single("profilePic"), updateProfile);
// Get feed (all posts or user-specific)
router.get("/", authMiddleware, getFeed);

// Like a post
router.put("/:id/like", authMiddleware, likePost);

// Comment on a post
router.post("/:id/comment", authMiddleware, commentOnPost);

export default router;
