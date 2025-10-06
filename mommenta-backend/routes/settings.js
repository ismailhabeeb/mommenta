import express from "express";
import {
  updateProfile,
  changePassword,
  togglePrivacy,
  deleteAccount
} from "../controllers/settingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", authMiddleware, updateProfile);      // update username/bio/pic
router.put("/password", authMiddleware, changePassword);    // change password
router.put("/privacy", authMiddleware, togglePrivacy);      // toggle public/private
router.delete("/", authMiddleware, deleteAccount);          // delete account

export default router;
