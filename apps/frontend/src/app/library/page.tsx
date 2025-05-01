"use client";

import { TvMinimal, Disc3, Book, Gamepad2 } from "lucide-react";
import LibrarySection from "@/components/library/LibrarySection";

export default function LibraryPage() {
  return (
    <main className="flex justify-center items-center h-1/2 gap-10">
      <LibrarySection
        label="Watched"
        icon={TvMinimal}
        href="/library/watched"
      />
      <LibrarySection label="Music" icon={Disc3} />
      <LibrarySection label="Books" icon={Book} />
      <LibrarySection label="Games" icon={Gamepad2} />
    </main>
  );
}
