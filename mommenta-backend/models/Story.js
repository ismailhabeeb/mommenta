import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true },
  publicId: { type: String, select: false },
  type: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String, maxlength: 500, default: "" },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  viewRecords: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, required: true },
  }],
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Story", storySchema);
