import DeviceToken from "../models/DeviceToken.js";
import Notification from "../models/Notification.js";

const FCM_BATCH_LIMIT = 500;
const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

const SOCIAL_EVENT_CONTENT = {
  follow: {
    title: "New follower",
    body: "Someone started following you.",
    path: (actorId) => `/profile/${encodeURIComponent(actorId)}`,
  },
  like: {
    title: "New like",
    body: "Someone liked your post.",
    path: () => "/home",
  },
  comment: {
    title: "New comment",
    body: "Someone commented on your post.",
    path: () => "/home",
  },
};

const normalizeId = (id) => id?.toString();
const MAX_PUSH_BODY_LENGTH = 300;

const getChatPushBody = (text, media = []) => {
  const messageText = typeof text === "string" ? text.trim() : "";
  if (messageText) {
    return messageText.length > MAX_PUSH_BODY_LENGTH
      ? `${messageText.slice(0, MAX_PUSH_BODY_LENGTH - 1)}…`
      : messageText;
  }

  if (media.length === 1) {
    if (media[0].mediaType === "image") return "Sent you a photo";
    if (media[0].mediaType === "video") return "Sent you a video";
  }
  if (media.length > 1) return "Sent you attachments";
  return "Sent you an attachment";
};

const sendPushToUser = async ({ userId, actorId, title, body, path }) => {
  if (!userId || normalizeId(userId) === normalizeId(actorId)) return;

  let devices;
  try {
    devices = await DeviceToken.find({ user: userId }).select("token").lean();
  } catch {
    return;
  }
  if (!devices?.length) return;

  let messaging;
  try {
    ({ messaging } = await import("../config/firebaseAdmin.js"));
  } catch {
    return;
  }

  const tokens = devices.map(({ token }) => token).filter(Boolean);
  for (let offset = 0; offset < tokens.length; offset += FCM_BATCH_LIMIT) {
    const batch = tokens.slice(offset, offset + FCM_BATCH_LIMIT);
    try {
      const result = await messaging.sendEachForMulticast({
        tokens: batch,
        // Data-only payload: the service worker owns background display, avoiding
        // duplicate notifications from FCM's automatic display plus showNotification.
        data: { title, body, link: path },
      });

      const invalidTokens = result.responses.flatMap((response, index) =>
        !response.success && INVALID_TOKEN_CODES.has(response.error?.code)
          ? [batch[index]]
          : []
      );
      if (invalidTokens.length) {
        await DeviceToken.deleteMany({ token: { $in: invalidTokens } });
      }
    } catch {
      // A push failure must not affect the action that triggered it.
    }
  }
};

const emitSocketNotification = (app, recipientId, notification, message) => {
  try {
    const io = app?.get("io");
    if (!io) return;

    io.to(`user:${normalizeId(recipientId)}`).emit("newNotification", {
      ...notification.toObject(),
      message,
    });
  } catch {
    // Socket delivery is best-effort and does not affect persistence or push.
  }
};

export const notifySocialEvent = async ({
  app,
  recipientId,
  actorId,
  type,
  postId,
}) => {
  const content = SOCIAL_EVENT_CONTENT[type];
  if (!content || !recipientId || !actorId) return;
  if (normalizeId(recipientId) === normalizeId(actorId)) return;

  let notification;
  try {
    notification = await Notification.create({
      user: recipientId,
      sender: actorId,
      type,
      ...(postId ? { post: postId } : {}),
    });
    await notification.populate([
      { path: "sender", select: "username profilePic" },
      { path: "post", select: "media caption" },
    ]);
    emitSocketNotification(app, recipientId, notification, content.body);
  } catch {
    // Keep the underlying social action successful if notification storage fails.
  }

  await sendPushToUser({
    userId: recipientId,
    actorId,
    title: content.title,
    body: content.body,
    path: content.path(actorId),
  });
};

export const notifyChatRecipients = async ({
  recipientIds,
  senderId,
  senderName,
  text,
  media,
}) => {
  const recipients = [...new Set((recipientIds || []).map(normalizeId))].filter(
    (recipientId) => recipientId && recipientId !== normalizeId(senderId)
  );

  const title =
    typeof senderName === "string" && senderName.trim()
      ? senderName.trim().slice(0, 100)
      : "New message";
  const body = getChatPushBody(text, media);

  await Promise.all(
    recipients.map((recipientId) =>
      sendPushToUser({
        userId: recipientId,
        actorId: senderId,
        title,
        body,
        path: "/home",
      })
    )
  );
};
