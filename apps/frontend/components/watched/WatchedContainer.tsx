"use client";

import { useEffect, useState } from "react";
import WatchedElement from "./WatchedElement";
import LogWatchedForm from "./LogWatchedForm";
import { X } from "lucide-react";

const userId = "60807a5abce72c511dab5559";

export default function WatchedContainer() {
  const [elements, setElements] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchWatched = async () => {
    const res = await fetch(`http://localhost:5000/api/watched/${userId}`);
    const data = await res.json();
    setElements(data);
  };

  useEffect(() => {
    fetchWatched();
  }, []);

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="relative bg-powder rounded-lg shadow-lg p-6 w-full max-w-md">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <LogWatchedForm
              userId={userId}
              onNew={() => {
                fetchWatched();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="bg-ashe min-h-screen p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {elements.map((element: any) => (
            <WatchedElement key={element._id} {...element} />
          ))}
        </div>
      </div>

      {/* Button to open modal — rendered inside right aside */}
      <div className="fixed top-28 right-8 z-40">
        <button
          onClick={() => setShowModal(true)}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition"
        >
          +
        </button>
      </div>
    </>
  );
}
