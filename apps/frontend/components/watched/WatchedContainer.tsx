"use client";

import { useEffect, useState } from "react";
import LogWatchedForm from "./LogWatchedForm";
import WatchedElement from "./WatchedElement";

const userId = "60807a5abce72c511dab5559";

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
    <div className="bg-ashe rounded-xl min-h-screen mt-6 p-10">
      <LogWatchedForm userId={userId} onNew={fetchWatched} />

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {elements.map((element: any) => (
          <WatchedElement key={element._id} {...element} />
        ))}
      </div>
    </div>
  );
}
