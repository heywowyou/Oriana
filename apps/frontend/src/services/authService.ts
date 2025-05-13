import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import axios from "axios";

const firebaseAuth = getAuth(app); // Consistent auth instance

export const syncUserWithBackend = async (
  user: FirebaseUser,
  idToken: string
): Promise<void> => {
  if (!user || !idToken) {
    console.error("syncUserWithBackend: User or ID token is missing.");
    throw new Error("User or ID token is missing for sync.");
  }

  const payload = {
    firebaseUID: user.uid,
    email: user.email,
    displayName: user.displayName || null, // Ensure null if undefined
    photoURL: user.photoURL || null, // Ensure null if undefined
  };

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("User synced with backend successfully.");
  } catch (error) {
    console.error("Error syncing user with backend:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "User sync with backend failed"
      );
    }
    throw new Error("User sync with backend failed");
  }
};

export const firebaseLoginUser = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  return userCredential.user; // Return the Firebase user object
};

export const firebaseRegisterUser = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  return userCredential.user; // Return the Firebase user object
};
