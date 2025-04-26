"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { registerUser, loginUser } from "@/services/authService";

interface RegisterModalProps {
  onSwitch: () => void; // Switch to login modal
}

const RegisterModal = ({ onSwitch }: RegisterModalProps) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      // Step 1: Register user to backend
      await registerUser(email, password, username);

      // Step 2: Immediately log in user
      const idToken = await loginUser(email, password);
      login(idToken);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Try another username or email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-4 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded mb-2"
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <span
            onClick={onSwitch}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
