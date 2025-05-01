"use client";

import { useEffect, useRef, useState } from "react";
import WatchedElement from "./WatchedElement";
import LogWatchedForm from "./LogWatchedForm";
import EditWatchedForm from "./EditWatchedForm";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function WatchedContainer() {
  const [elements, setElements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingElement, setEditingElement] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { idToken } = useAuth();

  const currentYear = new Date().getFullYear();

  const total = elements.length;
  const thisYear = elements.filter((el: any) =>
    el.dateWatched?.startsWith(currentYear.toString())
  ).length;

  const countByType = elements.reduce(
    (acc: Record<string, number>, el: any) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    },
    {}
  );

  const fetchWatched = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watched/me`, {
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
              className="absolute top-3 right-3 text-zinc-600 hover:text-sky-400 ease-in-out duration-200"
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
      <div className="flex justify-center mt-10">
        <div className="relative flex flex-col gap-10 w-full max-w-[1200px] pb-60">
          {/* Create Button */}
          <div className="absolute top-0 -right-20 z-40 hover:scale-110 ease-in-out duration-200">
            <button
              onClick={() => {
                setShowModal(true);
                setEditingElement(null);
              }}
              className="w-10 h-10 flex items-center justify-center bg-powder hover:bg-sky-400 hover:text-powder text-white rounded-lg shadow-lg ease-in-out duration-200"
              aria-label="Add new"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Panel */}
          <div className="absolute top-0 -left-64 z-40">
            <div className="w-48 bg-powder text-zinc-400 text-sm rounded-lg shadow px-4 py-4">
              <p className="font-medium text-white mb-2">Stats</p>
              <ul className="space-y-1">
                <li>
                  Total: <span className="text-white">{total}</span>
                </li>
                <li>
                  This year: <span className="text-white">{thisYear}</span>
                </li>
                <li>
                  Movies:{" "}
                  <span className="text-white">{countByType.movie || 0}</span>
                </li>
                <li>
                  Shows:{" "}
                  <span className="text-white">{countByType.show || 0}</span>
                </li>
                <li>
                  Anime:{" "}
                  <span className="text-white">{countByType.anime || 0}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Watched content grouped by year */}
          {Object.entries(
            elements
              .sort((a: any, b: any) => {
                const dateA = a.dateWatched
                  ? new Date(a.dateWatched).getTime()
                  : 0;
                const dateB = b.dateWatched
                  ? new Date(b.dateWatched).getTime()
                  : 0;
                return dateB - dateA;
              })
              .reduce((acc: Record<string, any[]>, element: any) => {
                const year = element.dateWatched
                  ? new Date(element.dateWatched).getFullYear().toString()
                  : "Unknown";
                if (!acc[year]) acc[year] = [];
                acc[year].push(element);
                return acc;
              }, {})
          )
            .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
            .map(([year, group]) => (
              <section key={year} className="bg-powder rounded-xl px-2 py-2">
                <div className="flex flex-wrap gap-6 justify-center w-full px-6 py-6">
                  {group.map((element) => (
                    <WatchedElement
                      key={element._id}
                      {...element}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </>
  );
}
