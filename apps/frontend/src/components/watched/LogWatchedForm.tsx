"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/uploadImage";
import WatchedFormFields from "./WatchedFormFields";

export default function LogWatchedForm({ onNew }: { onNew: () => void }) {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [type, setType] = useState<"movie" | "show" | "anime">("movie");
  const [rating, setRating] = useState(0);
  const [dateWatched, setDateWatched] = useState("");
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watched`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ title, cover, type, rating, dateWatched }),
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
      <WatchedFormFields
        title={title}
        setTitle={setTitle}
        cover={cover}
        setCover={setCover}
        rating={rating}
        setRating={setRating}
        type={type}
        setType={setType}
        dateWatched={dateWatched}
        setDateWatched={setDateWatched}
        uploading={uploading}
        handleFileChange={handleFileChange}
      />
      <div className="text-right">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-sky-400 text-powder hover:scale-105 ease-in-out duration-200"
        >
          Create
        </button>
      </div>
    </form>
  );
}
