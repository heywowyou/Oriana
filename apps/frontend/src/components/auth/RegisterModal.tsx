"use client";

import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth"; // Import FirebaseUser
import {
  firebaseRegisterUser,
  syncUserWithBackend,
} from "@/services/authService"; // Use updated service functions
// import { useAuth } from "@/context/AuthContext"; // Likely not needed here

interface RegisterModalProps {
  onSwitch: () => void;
  onRegisterSuccess?: () => void; // Optional callback
}

const RegisterModal = ({ onSwitch, onRegisterSuccess }: RegisterModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      // Step 1: Firebase Register using the service function
      const user: FirebaseUser = await firebaseRegisterUser(email, password);

      // Step 2: Get fresh ID token
      const idToken = await user.getIdToken(true); // Force refresh

      // Step 3: Sync user with your backend
      await syncUserWithBackend(user, idToken);

      console.log("Registration and sync successful. AuthContext will update.");
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      // AuthContext's onAuthStateChanged handles global state update
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please choose a stronger password (at least 6 characters)."
        );
      } else if (err.message && typeof err.message === "string") {
        setError(err.message); // Display error message from syncUserWithBackend if it throws
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-powder flex justify-center items-center z-50 cursor-default">
      <div className="bg-ashe p-8 rounded shadow-md w-80">
        <h2 className="text-zinc-400 text-xl mb-4 text-center">Register</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-powder text-zinc-400 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email for registration"
        />
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          className="w-full bg-powder text-zinc-400 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password for registration"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded mb-2 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="text-center text-sm text-zinc-400">
          Already have an account ?{" "}
          <span
            onClick={onSwitch}
            className="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
