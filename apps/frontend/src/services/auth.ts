import { auth } from "@/lib/firebase"; // Import the Firebase Auth instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Function to sign up a new user with email and password
// @param email The user's email
// @param password The user's password
// @returns The created user object
export async function signup(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// Function to log in an existing user
// @param email The user's email
// @param password The user's password
// @returns The logged-in user object
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// Function to log out the currently authenticated user
export async function logout() {
  await signOut(auth);
}
