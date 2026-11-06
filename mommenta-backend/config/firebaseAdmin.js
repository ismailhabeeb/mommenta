import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configuredCredentialPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const credentialPath = configuredCredentialPath
  ? resolve(configuredCredentialPath)
  : resolve(
      backendDirectory,
      "mommenta-bbb8e-firebase-adminsdk-fbsvc-b4a4b573bd.json"
    );

if (!existsSync(credentialPath)) {
  throw new Error(
    "Firebase Admin credential file is missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or provide the local backend credential file."
  );
}

const existingDefaultApp = getApps().find((app) => app.name === "[DEFAULT]");

let firebaseAdminApp;
try {
  firebaseAdminApp =
    existingDefaultApp ??
    initializeApp({ credential: cert(credentialPath) });
} catch {
  throw new Error(
    "Firebase Admin could not initialize. Verify the configured service-account file is valid JSON and readable."
  );
}

const messaging = getMessaging(firebaseAdminApp);

export { firebaseAdminApp, messaging };