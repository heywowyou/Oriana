"use client";

import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="bg-ashe text-white py-4 shadow-md">
      <div className="max-w-[1200px] mx-auto flex justify-start items-baseline gap-10">
        <Link href="/" className="text-xl font-medium">
          Oriana
        </Link>
        <nav className="flex text-sm font-normal gap-6">
          <Link href="/library" className="text-lg">
            Library
          </Link>
        </nav>
        <nav>{isLoggedIn && <LogoutButton />}</nav>
      </div>
    </header>
  );
}
