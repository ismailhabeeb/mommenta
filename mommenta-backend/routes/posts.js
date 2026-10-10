import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  editPost,
  getFeed,
  getPostById,
  getPostComments,
  likePost,
} from "../controllers/postController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create a new post
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      const error = new Error("Posts can only contain images or videos");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

router.post("/", auth, upload.array("media", 5), createPost);
// router.put("/profile", auth, upload.single("profilePic"), updateProfile);
// Get feed (all posts or user-specific)
router.get("/", authMiddleware, getFeed);
router.get("/:id/comments", authMiddleware, getPostComments);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, editPost);
router.delete("/:id", authMiddleware, deletePost);

// Like a post
router.put("/:id/like", authMiddleware, likePost);

// Comment on a post
router.post("/:id/comment", authMiddleware, commentOnPost);

export default router;
