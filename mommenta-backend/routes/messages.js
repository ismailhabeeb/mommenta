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
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

router.get("/conversations", authMiddleware, getConversations);
router.get("/:chatId", authMiddleware, getMessages);
router.post("/:chatId", authMiddleware, upload.array("media", 5), sendMessage);
router.post("/start/:userId", authMiddleware, startConversation);
router.put("/:chatId/read", authMiddleware, markMessagesRead);

export default router;
