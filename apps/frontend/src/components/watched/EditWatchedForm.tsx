"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";
import { useAuth } from "@/context/AuthContext";

type EditWatchedFormProps = {
  element: {
    _id: string;
    title: string;
    cover?: string;
    rating?: number;
    type: "movie" | "show" | "anime";
    dateWatched?: string;
  };
  onUpdated: () => void;
};

export default function EditWatchedForm({
  element,
  onUpdated,
}: EditWatchedFormProps) {
  const [title, setTitle] = useState(element.title);
  const [cover, setCover] = useState(element.cover || "");
  const [type, setType] = useState<"movie" | "show" | "anime">(element.type);
  const [rating, setRating] = useState(element.rating || 0);
  const [dateWatched, setDateWatched] = useState(
    element.dateWatched ? element.dateWatched.slice(0, 10) : ""
  );
  const [uploading, setUploading] = useState(false);
  const { idToken } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watched/${element._id}`, {
      method: "PUT",
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

    onUpdated();
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
          className="w-full bg-ashe text-gray-400 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block text-sm text-gray-400"
        />
        {uploading && (
          <p className="text-xs text-gray-400 mt-1">Uploading new cover...</p>
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
          Save Changes
        </button>
      </div>
    </form>
  );
}
