import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true }, // image or video
  type: { type: String, enum: ["image", "video"], default: "image" },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // who viewed
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Story", storySchema);
