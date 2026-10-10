import express from "express";
import {
  acceptFollowRequest,
  declineFollowRequest,
  followUser,
  getFollowers,
  getFollowRequests,
  getFollowing,
  getProfile,
  unfollowUser,
  updateProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Follow another user
router.put("/:id/follow", auth, followUser);

// Unfollow another user
router.put("/:id/unfollow", auth, unfollowUser);
router.get("/follow-requests", authMiddleware, getFollowRequests);
router.put("/follow-requests/:requesterId/accept", authMiddleware, acceptFollowRequest);
router.delete("/follow-requests/:requesterId", authMiddleware, declineFollowRequest);
router.get("/:id/followers", authMiddleware, getFollowers);
router.get("/:id/following", authMiddleware, getFollowing);

// Get a user's profile
router.get("/:id",auth, getProfile);

// Update profile
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Profile pictures must be images");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});
router.put("/update", auth, upload.single("profilePic"), updateProfile);

export default router;
