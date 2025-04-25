"use client";

import { useState } from "react";

export default function LogWatchedForm({
  userId,
  onNew,
}: {
  userId: string;
  onNew: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");
  const [cover, setCover] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userId, title, type, cover, note, rating }),
    });

    onNew(); // refresh list
    setTitle("");
    setCover("");
    setNote("");
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Title"
        className="input"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="input"
      >
        <option value="movie">Movie</option>
        <option value="show">Show</option>
        <option value="anime">Anime</option>
      </select>
      <input
        value={cover}
        onChange={(e) => setCover(e.target.value)}
        placeholder="Cover URL"
        className="input"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note"
        className="input"
      />
      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        min={0}
        max={10}
        className="input"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Watched
      </button>
    </form>
  );
}
