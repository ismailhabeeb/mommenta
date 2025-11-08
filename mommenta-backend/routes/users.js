import express from "express";
import { followUser, unfollowUser, updateProfile, getProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Follow another user
router.put("/:id/follow", auth, followUser);

// Unfollow another user
router.put("/:id/unfollow", auth, unfollowUser);

// Get a user's profile
router.get("/:id",auth, getProfile);

// Update profile
const upload = multer({ dest: "uploads/" }); // temp folder
router.put("/update", auth, upload.single("profilePic"), updateProfile);

export default router;
