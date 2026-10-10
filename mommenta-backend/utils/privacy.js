import User from "../models/User.js";

export const canViewUserContent = async (viewerId, ownerId) => {
  if (!viewerId || !ownerId) return false;
  if (viewerId.toString() === ownerId.toString()) return true;
  return Boolean(await User.exists({
    _id: ownerId,
    $or: [{ isPrivate: { $ne: true } }, { followers: viewerId }],
  }));
};

export const getHiddenPrivateUserIds = async (viewerId, visibleUserIds = []) => {
  const visibleIds = [viewerId, ...visibleUserIds];
  const privateUsers = await User.find({
    isPrivate: true,
    _id: { $nin: visibleIds },
  }).select("_id").lean();
  return privateUsers.map((user) => user._id);
};
