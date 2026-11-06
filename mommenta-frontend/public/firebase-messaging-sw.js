/* Firebase web configuration is supplied as query parameters by firebase.js.
 * These values are public client configuration; never put Admin credentials here.
 */
/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const configParams = new URL(self.location.href).searchParams;
const firebaseConfig = {
  apiKey: configParams.get("apiKey"),
  authDomain: configParams.get("authDomain"),
  projectId: configParams.get("projectId"),
  storageBucket: configParams.get("storageBucket"),
  messagingSenderId: configParams.get("messagingSenderId"),
  appId: configParams.get("appId"),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Mommenta";
    const options = {
      body: payload.notification?.body || "You have a new notification.",
      icon: "/vite.svg",
      data: { link: payload.data?.link || payload.data?.url || "/" },
    };
    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const requestedLink = event.notification.data?.link;
  let targetUrl = new URL("/", self.location.origin).href;
  if (typeof requestedLink === "string") {
    try {
      const parsed = new URL(requestedLink, self.location.origin);
      if (parsed.origin === self.location.origin) targetUrl = parsed.href;
    } catch {
      // Ignore malformed navigation data and open the app root instead.
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          if ("navigate" in client) await client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
