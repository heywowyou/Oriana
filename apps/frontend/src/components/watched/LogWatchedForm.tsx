"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  userId: string;
  onNew: () => void;
};

export default function LogWatchedForm({ userId, onNew }: Props) {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [type, setType] = useState<"movie" | "show" | "anime">("movie");
  const [rating, setRating] = useState(0);
  const [dateWatched, setDateWatched] = useState(""); // New state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userId,
        title,
        cover,
        type,
        rating,
        dateWatched,
      }),
    });

    setTitle("");
    setCover("");
    setType("movie");
    setRating(0);
    setDateWatched("");
    onNew();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 caret-gray-400">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-ashe text-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cover URL */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Cover URL</label>
        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          className="w-full bg-ashe text-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Rating selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-yellow-500"
            >
              <Star
                className={`w-6 h-6 ${
                  rating >= star ? "fill-yellow-500" : "fill-none"
                } stroke-current`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Type selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Type</label>
        <div className="flex gap-3">
          {["movie", "show", "anime"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t as "movie" | "show" | "anime")}
              className={`px-4 py-2 rounded ${
                type === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-400 bg-ashe hover:bg-gray-100"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Date Watched selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Date Watched</label>
        <input
          type="date"
          value={dateWatched}
          onChange={(e) => setDateWatched(e.target.value)}
          className="w-full bg-ashe text-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit button */}
      <div className="text-right">
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
        >
          Create
        </button>
      </div>
    </form>
  );
}
