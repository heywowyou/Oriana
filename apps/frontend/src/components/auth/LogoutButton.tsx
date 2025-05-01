"use client";

import { useAuth } from "@/context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-neutral-100 px-6 py-2 rounded-lg shadow-lg hover:bg-ashe transition ease-in-out duration-200"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
