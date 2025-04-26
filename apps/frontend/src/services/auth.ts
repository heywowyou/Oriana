import { auth } from "@/lib/firebase"; // Firebase Auth instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Signup
export async function signup(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// Login
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// Logout
export async function logout() {
  await signOut(auth);
}

// Get current user's ID token
export async function getCurrentToken() {
  const user = auth.currentUser;
  if (!user) return null;

  return await user.getIdToken();
}

// Sync user with backend
export async function syncUserWithBackend() {
  const token = await getCurrentToken();
  if (!token) {
    console.error("No token available. User might not be logged in.");
    return;
  }

  await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/createIfNotExists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
