"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react"; // For loading state

const LogoutButton = () => {
  const { logout, isLoggedIn } = useAuth(); // Added isLoggedIn to conditionally render
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // After logout, onAuthStateChanged in AuthContext will clear context state.
      // You might want to redirect the user or update UI further here if needed.
      // e.g., router.push('/');
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
      disabled={loading} // Disable button while logging out
      className="text-neutral-100 px-6 py-2 rounded-lg shadow-lg hover:bg-ashe transition ease-in-out duration-200 disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
