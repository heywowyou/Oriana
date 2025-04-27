import admin from "firebase-admin";
import { firebaseCredentials } from "./firebaseCredentials";

console.log("ENV project id:", process.env.FIREBASE_PROJECT_ID);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseCredentials),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("Firebase Admin initialized");
}

export const bucket = admin.storage().bucket();
export const auth = admin.auth();
export default admin;
