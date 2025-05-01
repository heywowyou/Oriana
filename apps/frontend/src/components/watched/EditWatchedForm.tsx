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
        <label className="block text-sm text-zinc-400 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* Cover URL and Upload */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Cover URL</label>
        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="Paste an image URL or upload a file"
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <label
            htmlFor="cover-upload"
            className="px-4 py-2 border border-2 border-sky-400 hover:scale-105 text-zinc-400 hover:text-medium shadow-lg rounded-lg cursor-pointer ease-in duration-100"
          >
            Upload Image
          </label>
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading && (
            <span className="text-sm text-zinc-400">Uploading...</span>
          )}
        </div>

        {uploading && (
          <p className="text-xs text-zinc-400 mt-1">Uploading...</p>
        )}
      </div>

      {/* Rating selection */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-neutral-800 hover:scale-110 ease-in-out duration-100"
            >
              <Star
                className={`w-6 h-6 ${
                  rating >= star ? "text-sky-400 fill-sky-400" : "fill-none"
                } stroke-current`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Type selection */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Type</label>
        <div className="flex gap-3">
          {["movie", "show", "anime"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t as "movie" | "show" | "anime")}
              className={`px-4 py-2 rounded-lg hover:scale-105 ease-in-out duration-200 ${
                type === t
                  ? "bg-sky-400 text-powder"
                  : "text-zinc-400 border border-sky-400 border-2 hover:border-sky-400"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Date Watched selection */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Date Watched</label>
        <input
          type="date"
          value={dateWatched}
          onChange={(e) => setDateWatched(e.target.value)}
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit button */}
      <div className="text-right">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-sky-400 text-powder hover:scale-105 ease-in-out duration-200"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
