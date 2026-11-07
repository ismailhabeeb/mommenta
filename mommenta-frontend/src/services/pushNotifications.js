import { deleteToken, getToken, onMessage } from "firebase/messaging";
import toast from "react-hot-toast";
import API from "../api.js";
import {
  getFirebaseMessaging,
  getMessagingServiceWorker,
  hasFirebaseMessagingConfig,
  isPushSupported,
  PUSH_OPT_IN_KEY,
  vapidPublicKey,
} from "../firebase.js";

const MAX_TOKEN_LENGTH = 4096;

const currentDeviceLabel = () => {
  const label = navigator.userAgentData?.platform || navigator.platform || "Web browser";
  return label.slice(0, 100);
};

const getCurrentFcmToken = async ({ requestPermission = false } = {}) => {
  if (!hasFirebaseMessagingConfig) {
    throw new Error("Browser notifications are not configured yet.");
  }
  if (!isPushSupported()) {
    throw new Error("This browser or connection does not support web notifications.");
  }

  let permission = Notification.permission;
  if (permission === "default" && requestPermission) {
    permission = await Notification.requestPermission();
  }
  if (permission === "denied") {
    throw new Error("Notifications are blocked in browser settings.");
  }
  if (permission !== "granted") {
    throw new Error("Allow notification permission to enable browser notifications.");
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    throw new Error("Firebase Messaging is not supported in this browser.");
  }

  const serviceWorkerRegistration = await getMessagingServiceWorker();
  if (!serviceWorkerRegistration) {
    throw new Error("The notification service worker could not be registered.");
  }

  const token = await getToken(messaging, {
    vapidKey: vapidPublicKey,
    serviceWorkerRegistration,
  });
  if (!token || token.length > MAX_TOKEN_LENGTH) {
    throw new Error("Could not obtain a valid browser notification token.");
  }

  return { messaging, token };
};

const saveTokenForCurrentUser = async (token) => {
  await API.post("/device-tokens", {
    token,
    platform: "web",
    deviceLabel: currentDeviceLabel(),
  });
};

export const enableBrowserNotifications = async () => {
  const { token } = await getCurrentFcmToken({ requestPermission: true });
  await saveTokenForCurrentUser(token);
  localStorage.setItem(PUSH_OPT_IN_KEY, "true");
};

export const registerGrantedDeviceToken = async () => {
  if (Notification.permission !== "granted") return false;
  const { token } = await getCurrentFcmToken();
  await saveTokenForCurrentUser(token);
  return true;
};

export const removeCurrentDeviceToken = async () => {
  if (!hasFirebaseMessagingConfig || !isPushSupported()) return;

  const messaging = await getFirebaseMessaging();
  if (!messaging || Notification.permission !== "granted") return;

  const serviceWorkerRegistration = await getMessagingServiceWorker();
  if (!serviceWorkerRegistration) return;

  const token = await getToken(messaging, {
    vapidKey: vapidPublicKey,
    serviceWorkerRegistration,
  });
  if (token) {
    await API.delete("/device-tokens", { data: { token } });
    await deleteToken(messaging);
  }
};

export const disableBrowserNotifications = async () => {
  await removeCurrentDeviceToken();
  localStorage.removeItem(PUSH_OPT_IN_KEY);
};

export const listenForForegroundMessages = async () => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const title = payload.data?.title || payload.notification?.title || "Mommenta";
    const body = payload.data?.body || payload.notification?.body;
    if (body) toast(`${title}: ${body}`, { duration: 5000 });
  });
};
