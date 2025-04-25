"use client";

import { useEffect, useRef, useState } from "react";
import WatchedElement from "./WatchedElement";
import LogWatchedForm from "./LogWatchedForm";
import { X } from "lucide-react";

const userId = "60807a5abce72c511dab5559";

export default function WatchedContainer() {
  const [elements, setElements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const fetchWatched = async () => {
    const res = await fetch(`http://localhost:5000/api/watched/${userId}`);
    const data = await res.json();
    setElements(data);
  };

  useEffect(() => {
    fetchWatched();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="relative bg-powder rounded-lg shadow-lg p-6 w-full max-w-md"
          >
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
      <div className="bg-ashe rounded-lg min-h-screen mt-10 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {elements.map((element: any) => (
            <WatchedElement key={element._id} {...element} />
          ))}
        </div>
      </div>

      {/* Button to open modal */}
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
