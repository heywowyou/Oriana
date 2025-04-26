"use client";

import { useState } from "react";
import { signup, login } from "../../src/services/auth";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      await signup(email, password);
      console.log("✅ Signed up and synced user");
    } catch (err) {
      console.error(err);
      setError("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      console.log("✅ Logged in and synced user");
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-md mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up / Login</h1>
      <div className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white p-2 rounded w-full"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
          <button
            className="bg-green-500 text-white p-2 rounded w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
