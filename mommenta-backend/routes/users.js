import express from "express";
import { followUser, unfollowUser, getUserProfile, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Follow another user
router.put("/:id/follow", authMiddleware, followUser);

// Unfollow another user
router.put("/:id/unfollow", authMiddleware, unfollowUser);

// Get a user's profile
router.get("/:id", authMiddleware, getUserProfile);

// Update profile
const upload = multer({ dest: "uploads/" }); // temp folder
router.put("/update", auth, upload.single("profilePic"), updateProfile);

export default router;
