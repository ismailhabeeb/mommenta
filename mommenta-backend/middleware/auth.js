import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }

  if (!decoded || typeof decoded === "string" || !decoded.id) {
    return res.status(401).json({ msg: "Invalid token" });
  }
  const user = await User.findById(decoded.id).select("_id isBanned");
  if (!user) return res.status(401).json({ msg: "User not found" });
  if (user.isBanned) return res.status(403).json({ msg: "This account is unavailable" });

  req.user = decoded;
  next();
};