import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

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

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const idToken = await userCredential.user.getIdToken();
  return idToken;
};

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

export const getMyProfile = async (idToken: string) => {
  return fetchWithAuth("http://localhost:4000/users/me", idToken);
};
