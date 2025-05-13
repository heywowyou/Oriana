"use client";

import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth"; // Import FirebaseUser for type safety
import { firebaseLoginUser, syncUserWithBackend } from "@/services/authService"; // Use updated service functions

interface LoginModalProps {
  onSwitch: () => void;
  onLoginSuccess?: () => void; // Optional: To close modal or trigger other actions
}

const LoginModal = ({ onSwitch, onLoginSuccess }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Step 1: Firebase Login using the service function
      const user: FirebaseUser = await firebaseLoginUser(email, password);

      // Step 2: Get fresh ID token (Firebase Auth state is now updated)
      // user.getIdToken(true) ensures a fresh token from Firebase servers
      const idToken = await user.getIdToken(true);

      // Step 3: Sync user with your backend using the service function
      await syncUserWithBackend(user, idToken);

      console.log(
        "Login and sync successful. AuthContext will update via onAuthStateChanged."
      );
      if (onLoginSuccess) {
        onLoginSuccess(); // Call success callback if provided
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Login failed. Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many login attempts. Please try again later.");
      } else if (err.message && typeof err.message === "string") {
        setError(err.message); // Display error message from syncUserWithBackend if it throws
      } else {
        setError("Login failed. An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-powder flex justify-center items-center z-50 cursor-default">
      <div className="bg-ashe p-8 rounded shadow-md w-80">
        <h2 className="text-zinc-400 text-xl mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-powder text-zinc-400 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email for login"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-powder text-zinc-400 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password for login"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded mb-2 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm text-zinc-400">
          Don't have an account ?{" "}
          <span
            onClick={onSwitch}
            className="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
