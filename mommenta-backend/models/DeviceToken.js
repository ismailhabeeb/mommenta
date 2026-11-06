import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["web", "ios", "android"],
    },
    deviceLabel: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    lastSeenAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

deviceTokenSchema.index({ token: 1 }, { unique: true });

export default mongoose.model("DeviceToken", deviceTokenSchema);
