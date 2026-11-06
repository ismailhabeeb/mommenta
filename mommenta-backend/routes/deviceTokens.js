import express from "express";
import {
  registerDeviceToken,
  removeDeviceToken,
} from "../controllers/deviceTokenController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, registerDeviceToken);
router.delete("/", authMiddleware, removeDeviceToken);

export default router;
