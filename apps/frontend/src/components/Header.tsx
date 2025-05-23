"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="bg-ashe text-white py-3 shadow-md">
      <div className="max-w-[1200px] mx-auto flex justify-between">
        <div className="flex items-center gap-16">
          <Link href="/" className="text-xl font-medium">
            <Image
              src="/logo/oriana_extra_bold.png"
              alt="Oriana Logo"
              width={120}
              height={120}
            />
          </Link>
          <nav className="flex text-sm font-normal text-neutral-100 gap-6">
            <Link href="/library" className="text-lg">
              Library
            </Link>
          </nav>
        </div>
        <div>
          <nav>{isLoggedIn && <LogoutButton />}</nav>
        </div>
      </div>
    </header>
  );
}
