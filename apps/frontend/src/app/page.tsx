"use client";

import { useAuth } from "../context/AuthContext";
import AuthForm from "../../components/auth/AuthForm";

const Home = () => {
  const { isLoggedIn, idToken } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>
    </div>
  );
};

export default Home;
