import express from "express";
import { getPostsByHashtag } from "../controllers/hashtagController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:tag", authMiddleware, getPostsByHashtag);

export default router;
