"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/uploadImage";

type Props = {
  userId: string;
  onNew: () => void;
};

export default function LogWatchedForm({ onNew }: { onNew: () => void }) {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [type, setType] = useState<"movie" | "show" | "anime">("movie");
  const [rating, setRating] = useState(0);
  const [dateWatched, setDateWatched] = useState("");
  const [uploading, setUploading] = useState(false);
  const { idToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:4000/watched", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadImage(file);
        setCover(url);
      } finally {
        setUploading(false);
      }
    }
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

      {/* Cover URL and Upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Cover URL</label>
        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="Paste an image URL or upload a file"
          className="w-full bg-ashe text-gray-400 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block text-sm text-gray-400"
        />
        {uploading && (
          <p className="text-xs text-gray-400 mt-1">Uploading...</p>
        )}
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
