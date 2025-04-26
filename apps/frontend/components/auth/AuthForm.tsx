"use client";

import { useState } from "react";
import { registerUser, loginUser } from "../../src/services/authService";

const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      await registerUser(email, password, username);
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
      const idToken = await loginUser(email, password);
      console.log("✅ Logged in. idToken:", idToken);
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w mx-auto bg-ashe p-6 rounded-md mt-10">
      <h1 className="text-lg mb-4 text-center">Sign Up / Login</h1>
      <div className="flex flex-col gap-4">
        <input
          className="bg-powder text-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="bg-powder text-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="bg-powder text-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-2">
          <button
            className="bg-powder text-white p-2 rounded-lg w-full"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded-lg w-full"
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
