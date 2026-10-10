import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }

  if (!decoded || typeof decoded === "string" || !decoded.id) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
  const user = await User.findById(decoded.id).select("_id isBanned");
  if (!user) return res.status(401).json({ msg: "User not found" });
  if (user.isBanned) return res.status(403).json({ msg: "This account is unavailable" });

  req.user = { id: decoded.id };
  next();
}
