import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
/**
 * @desc   Logout user (clear token cookie)
 * @route  POST /api/auth/logout
 * @access Private
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token"); // if using httpOnly cookie for JWT
  return res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @desc   Get current user
 * @route  GET /api/auth/current
 * @access Private
 */
router.get("/me", authMiddleware, getMe); 


export default router; 
