import express from "express";
import {
  getNotifications,
  clearNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/:id/read", authMiddleware, markAsRead);
router.put("/read-all", authMiddleware, markAllAsRead);
router.delete("/", authMiddleware, clearNotifications);

export default router;
