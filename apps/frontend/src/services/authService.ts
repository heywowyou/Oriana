import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  username: string
) => {
  const response = await fetch("http://localhost:4000/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

// Login with email and password
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const idToken = await userCredential.user.getIdToken();
  return idToken;
};

// Fetch a resource with Authorization token
export const fetchWithAuth = async (url: string, idToken: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// Get user's profile
export const getMyProfile = async (idToken: string) => {
  return fetchWithAuth("http://localhost:4000/users/me", idToken);
};

// Login with username and password
export const loginWithUsername = async (username: string, password: string) => {
  // Ask backend to find the email by username
  const response = await fetch(
    "http://localhost:4000/users/login-by-username",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Username not found");
  }

  const email = data.email;

  // Login with found email
  const idToken = await loginUser(email, password);

  return idToken;
};
