import Link from "next/link";

export default function LibraryPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Library</h1>
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <Link
          href="/library/watched"
          className="bg-gray-800 text-white p-4 rounded-xl text-center hover:bg-gray-700 transition"
        >
          Watched
        </Link>
        <button
          className="bg-gray-300 text-gray-600 p-4 rounded-xl text-center cursor-not-allowed"
          disabled
        >
          Music
        </button>
        <button
          className="bg-gray-300 text-gray-600 p-4 rounded-xl text-center cursor-not-allowed"
          disabled
        >
          Books
        </button>
        <button
          className="bg-gray-300 text-gray-600 p-4 rounded-xl text-center cursor-not-allowed"
          disabled
        >
          Games
        </button>
      </div>
    </main>
  );
}
