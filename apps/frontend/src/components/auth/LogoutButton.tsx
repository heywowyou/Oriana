"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { LogOut } from "lucide-react"; // Lucide icon for logout

const LogoutButton = () => {
  const { logout, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      console.log("User logged out.");
    } catch (error) {
      console.error("Failed to logout:", error);
      // Handle error if needed (e.g., show a notification)
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    // Don't show logout button if not logged in
    return null;
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      // Standard padding for an icon button, plus hover/disabled states
      className="bg-powder text-zinc-200 p-3 rounded-2xl shadow hover:ring hover:ring-2 hover:ring-sky-400 transition ease-in duration-200 disabled:opacity-50 flex items-center justify-center"
      // ARIA label is crucial for icon-only buttons for accessibility
      aria-label="Logout"
    >
      <LogOut className="w-5 h-5" /> {/* Always display the LogOut icon */}
    </button>
  );
};

export default LogoutButton;
