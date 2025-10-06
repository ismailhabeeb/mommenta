import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" }, // store image URL (Cloudinary/S3 later)
  bio: { type: String, default: "" },
  location:{type: String, default: ""},
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // 📌 Saved posts
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
   // ⚙️ Privacy
   isPrivate: { type: Boolean, default: false },
   // 🚨 Admin tools
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
