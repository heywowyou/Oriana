"use client";

import { Star } from "lucide-react";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  cover: string;
  setCover: (v: string) => void;
  rating: number;
  setRating: (v: number) => void;
  type: "movie" | "show" | "anime";
  setType: (v: "movie" | "show" | "anime") => void;
  dateWatched: string;
  setDateWatched: (v: string) => void;
  uploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function WatchedFormFields({
  title,
  setTitle,
  cover,
  setCover,
  rating,
  setRating,
  type,
  setType,
  dateWatched,
  setDateWatched,
  uploading,
  handleFileChange,
}: Props) {
  return (
    <>
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
      </div>

      {/* Rating */}
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

      {/* Type */}
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

      {/* Date */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Date Watched</label>
        <input
          type="date"
          value={dateWatched}
          onChange={(e) => setDateWatched(e.target.value)}
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
}
