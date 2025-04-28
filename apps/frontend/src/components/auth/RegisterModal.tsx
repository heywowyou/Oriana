"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { syncUser } from "@/services/authService";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

interface RegisterModalProps {
  onSwitch: () => void;
}

const RegisterModal = ({ onSwitch }: RegisterModalProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user) {
        throw new Error("No user returned from sign in.");
      }

      // Sync the user with your MongoDB backend
      await syncUser(user);
      const idToken = await user.getIdToken();
      login(idToken);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Try another email.");
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
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-powder text-zinc-400 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded mb-2"
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
