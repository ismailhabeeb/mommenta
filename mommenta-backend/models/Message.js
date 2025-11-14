// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "" },   // <-- FIXED
    read: { type: Boolean, default: false },

    media: [
      {
        mediaUrl: { type: String, required: true },
        mediaType: { type: String, required: true },  // <-- FIXED
      }
    ],

    readAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
