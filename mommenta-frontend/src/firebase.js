import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const vapidPublicKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
export const PUSH_OPT_IN_KEY = "mommentaPushOptIn";

const requiredConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "messagingSenderId",
  "appId",
];

export const hasFirebaseMessagingConfig =
  requiredConfigKeys.every((key) => Boolean(firebaseConfig[key])) &&
  Boolean(vapidPublicKey);

let firebaseApp = null;
if (hasFirebaseMessagingConfig) {
  try {
    firebaseApp =
      getApps().find((app) => app.name === "[DEFAULT]") ??
      initializeApp(firebaseConfig);
  } catch {
    firebaseApp = null;
  }
}

const messagingPromise = firebaseApp
  ? isSupported()
      .then((supported) => (supported ? getMessaging(firebaseApp) : null))
      .catch(() => null)
  : Promise.resolve(null);

export const getFirebaseMessaging = () => messagingPromise;

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  typeof window.Notification !== "undefined" &&
  "serviceWorker" in navigator &&
  window.isSecureContext &&
  hasFirebaseMessagingConfig;

export const getMessagingServiceWorker = async () => {
  if (!isPushSupported()) return null;

  const params = new URLSearchParams();
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
    { scope: "/" }
  );
};
