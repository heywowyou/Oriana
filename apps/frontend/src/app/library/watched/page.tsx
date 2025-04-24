"use client";

import { useRouter } from "next/navigation";

export default function WatchedPage() {
  const router = useRouter();

  return (
    <main className="p-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-500 mb-4 hover:underline"
      >
        Back to Library
      </button>
      <h1 className="text-2xl font-bold mb-4">Watched Media</h1>

      <div className="mb-4">
        {/* This will be replaced by your real media list */}
        <p className="text-gray-600">You haven’t logged anything yet.</p>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition">
        + Add Watched Item
      </button>
    </main>
  );
}
