import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);

export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const token = await userCredential.user.getIdToken();
  return token;
};

export const registerUser = async (
  email: string,
  password: string
): Promise<string> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const token = await userCredential.user.getIdToken();
  return token;
};
