"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginWithUsername } from "@/services/authService";

interface LoginModalProps {
  onSwitch: () => void;
}

const LoginModal = ({ onSwitch }: LoginModalProps) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const idToken = await loginWithUsername(username, password);
      login(idToken);
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-4 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded mb-2"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <span
            onClick={onSwitch}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
