import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase web app configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhuiTXxMdjzKSbcZGWRF1HooVfllZ2xD8",
  authDomain: "oriana-308063.firebaseapp.com",
  projectId: "oriana-308063",
  storageBucket: "oriana-308063.firebasestorage.app",
  messagingSenderId: "735013743426",
  appId: "1:735013743426:web:e8230a89d2b11e375e76db",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
