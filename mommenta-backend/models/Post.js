import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    media: [
      {
        mediaUrl: { type: String, required: true },
        mediaType: { type: String, enum: ["image", "video"], required: true }
      }
    ],
    caption: { type: String, maxlength: 2200 },
    hashtags: [{ type: String }], // 🏷 hashtags
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
