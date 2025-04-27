"use client";

import { useEffect, useRef, useState } from "react";
import WatchedElement from "./WatchedElement";
import LogWatchedForm from "./LogWatchedForm";
import EditWatchedForm from "./EditWatchedForm";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function WatchedContainer() {
  const [elements, setElements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingElement, setEditingElement] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { idToken } = useAuth();

  const fetchWatched = async () => {
    const res = await fetch(`http://localhost:4000/watched/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

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
        setEditingElement(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
      setEditingElement(null);
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

  const handleEdit = (element: any) => {
    setEditingElement(element);
    setShowModal(true);
  };

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
              onClick={() => {
                setShowModal(false);
                setEditingElement(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {editingElement ? (
              <EditWatchedForm
                element={editingElement}
                onUpdated={() => {
                  fetchWatched();
                  setShowModal(false);
                  setEditingElement(null);
                }}
              />
            ) : (
              <LogWatchedForm
                onNew={() => {
                  fetchWatched();
                  setShowModal(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="bg-ashe rounded-lg min-h-screen mt-10 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {elements.map((element: any) => (
            <WatchedElement
              key={element._id}
              {...element}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </div>

      {/* Button to open Create modal */}
      <div className="fixed top-28 right-8 z-40">
        <button
          onClick={() => {
            setShowModal(true);
            setEditingElement(null);
          }}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition"
        >
          +
        </button>
      </div>
    </>
  );
}
