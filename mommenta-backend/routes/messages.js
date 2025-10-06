import express from "express";
import { sendMessage, getMessages, markMessagesRead } from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send message
router.post("/", authMiddleware, sendMessage);

// Get conversation with a user
router.get("/:userId", authMiddleware, getMessages);
// Mark all messages from user as read
router.put("/:userId/read", authMiddleware, markMessagesRead);
export default router;
