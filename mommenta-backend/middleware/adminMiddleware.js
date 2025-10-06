import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  const user = await User.findById(req.user);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ msg: "Access denied. Admins only." });
  }
  next();
};

export default adminMiddleware;
