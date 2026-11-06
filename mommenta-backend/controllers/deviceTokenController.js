import mongoose from "mongoose";
import DeviceToken from "../models/DeviceToken.js";

const SUPPORTED_PLATFORMS = ["web", "ios", "android"];
const MAX_TOKEN_LENGTH = 4096;
const MAX_DEVICE_LABEL_LENGTH = 100;

const isDuplicateKeyError = (error) => error?.code === 11000;
const getAuthenticatedUserId = (req) => {
  const userId = req.user?.id;
  return typeof userId === "string" && mongoose.isValidObjectId(userId)
    ? userId
    : null;
};

const buildUpdate = ({ userId, platform, deviceLabel }) => {
  const set = {
    user: userId,
    lastSeenAt: new Date(),
  };

  if (platform !== undefined) set.platform = platform;
  if (deviceLabel !== undefined) set.deviceLabel = deviceLabel;

  return { $set: set };
};

export const registerDeviceToken = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ msg: "Valid authentication required" });
    }

    const { token, platform, deviceLabel } = req.body ?? {};
    const normalizedToken = typeof token === "string" ? token.trim() : "";

    if (!normalizedToken || normalizedToken.length > MAX_TOKEN_LENGTH) {
      return res.status(400).json({ msg: "A valid device token is required" });
    }

    if (platform !== undefined) {
      if (typeof platform !== "string") {
        return res.status(400).json({ msg: "Invalid device platform" });
      }
      if (!SUPPORTED_PLATFORMS.includes(platform)) {
        return res.status(400).json({ msg: "Unsupported device platform" });
      }
    }

    if (
      deviceLabel !== undefined &&
      (typeof deviceLabel !== "string" ||
        deviceLabel.trim().length > MAX_DEVICE_LABEL_LENGTH)
    ) {
      return res.status(400).json({ msg: "Invalid device label" });
    }

    const update = buildUpdate({
      userId,
      platform,
      deviceLabel:
        deviceLabel === undefined ? undefined : deviceLabel.trim(),
    });
    const options = { upsert: true, new: true, runValidators: true };

    let deviceToken;
    try {
      deviceToken = await DeviceToken.findOneAndUpdate(
        { token: normalizedToken },
        update,
        options
      );
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;

      // Another request inserted this token concurrently; update the winner.
      deviceToken = await DeviceToken.findOneAndUpdate(
        { token: normalizedToken },
        update,
        { ...options, upsert: false }
      );
      if (!deviceToken) throw error;
    }

    return res.status(200).json({
      msg: "Device token registered successfully",
      device: {
        id: deviceToken._id,
        platform: deviceToken.platform,
        deviceLabel: deviceToken.deviceLabel,
        lastSeenAt: deviceToken.lastSeenAt,
      },
    });
  } catch {
    return res.status(500).json({ msg: "Server error" });
  }
};

export const removeDeviceToken = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ msg: "Valid authentication required" });
    }

    const { token } = req.body ?? {};
    const normalizedToken = typeof token === "string" ? token.trim() : "";

    if (!normalizedToken || normalizedToken.length > MAX_TOKEN_LENGTH) {
      return res.status(400).json({ msg: "A valid device token is required" });
    }

    const removed = await DeviceToken.findOneAndDelete({
      token: normalizedToken,
      user: userId,
    });

    if (!removed) {
      return res.status(404).json({ msg: "Device token not found" });
    }

    return res.json({ msg: "Device token removed successfully" });
  } catch {
    return res.status(500).json({ msg: "Server error" });
  }
};
