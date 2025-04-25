// apps/frontend/components/watched/WatchedContainer.tsx

"use client";

import { useEffect, useState } from "react";
import LogWatchedForm from "./LogWatchedForm";
import WatchedElement from "./WatchedElement";

const userId = "60807a5abce72c511dab5559"; // for now

export default function WatchedContainer() {
  const [elements, setElements] = useState([]);

  const fetchWatched = async () => {
    const res = await fetch(`http://localhost:5000/api/watched/${userId}`);
    const data = await res.json();
    setElements(data);
  };

  useEffect(() => {
    fetchWatched();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Watched Media</h1>

      <LogWatchedForm userId={userId} onNew={fetchWatched} />

      <div className="grid gap-4 mt-6">
        {elements.map((element: any) => (
          <WatchedElement key={element._id} {...element} />
        ))}
      </div>
    </div>
  );
}
