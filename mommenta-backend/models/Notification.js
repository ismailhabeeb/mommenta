import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives the notification
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who triggered it
  type: { type: String, enum: ["follow", "followRequest", "like", "comment"], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // optional (for like/comment)
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
