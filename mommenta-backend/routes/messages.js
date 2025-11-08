// routes/messages.js
import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markMessagesRead
} from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/conversations", authMiddleware, getConversations);
router.get("/:chatId", authMiddleware, getMessages);
router.post("/:chatId", authMiddleware, sendMessage);
router.post("/start/:userId", authMiddleware, startConversation);
router.put("/:chatId/read", authMiddleware, markMessagesRead);

export default router;
