import express from "express";
import {
  reportPost,
  getReports,
  removePost,
  banUser,
  unbanUser
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Report post (normal user)
router.post("/report", authMiddleware, reportPost);

// Admin-only routes
router.get("/reports", authMiddleware, adminMiddleware, getReports);
router.delete("/post/:postId", authMiddleware, adminMiddleware, removePost);
router.put("/ban/:userId", authMiddleware, adminMiddleware, banUser);
router.put("/unban/:userId", authMiddleware, adminMiddleware, unbanUser);

export default router;
