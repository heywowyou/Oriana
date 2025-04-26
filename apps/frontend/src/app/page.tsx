"use client";

import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Show login/register modals
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>
      <LogoutButton />
    </div>
  );
};

export default Home;
