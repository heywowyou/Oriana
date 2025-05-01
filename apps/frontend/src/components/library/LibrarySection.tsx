"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  icon: LucideIcon;
  href?: string; // If undefined, the section is disabled
};

export default function LibrarySection({ label, icon: Icon, href }: Props) {
  const baseClasses =
    "flex flex-col items-center justify-center w-24 h-24 gap-2 rounded-xl text-sm font-medium transition";

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} bg-ashe text-zinc-200 hover:ring hover:ring-sky-400 hover:shadow-xl hover:scale-105 ease-in-out duration-200`}
      >
        <Icon className="w-8 h-8" />
        {label}
      </Link>
    );
  }

  return (
    <button
      className={`${baseClasses} bg-ashe text-zinc-600 cursor-not-allowed`}
      disabled
    >
      <Icon className="w-8 h-8" />
      {label}
    </button>
  );
}
