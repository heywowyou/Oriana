import {
  getAuth,
  getIdToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import axios from "axios";

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

export const syncUser = async (user: any) => {
  const auth = getAuth();
  const token = await getIdToken(auth.currentUser!);

  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`,
    {
      firebaseUID: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
