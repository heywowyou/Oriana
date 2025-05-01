"use client";

import { X, Star } from "lucide-react";
import { RefObject } from "react";

type Props = {
  element: {
    title: string;
    cover?: string;
    rating?: number;
    type: string;
    dateWatched?: string;
  };
  onClose: () => void;
  modalRef: RefObject<HTMLDivElement | null>;
};

export default function ViewWatchedModal({
  element,
  onClose,
  modalRef,
}: Props) {
  const rating = element.rating ?? 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-powder rounded-lg shadow-lg flex w-full max-w-3xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-600 hover:text-sky-400 ease-in-out duration-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-1/2 bg-black">
          <img
            src={element.cover || "/placeholder.jpg"}
            alt={element.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-1/2 p-6 flex flex-col gap-6 text-zinc-200">
          <h2 className="text-2xl font-bold mr-6">{element.title}</h2>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  rating >= i
                    ? "text-sky-400 fill-sky-400"
                    : "text-zinc-800 fill-powder"
                }`}
              />
            ))}
          </div>
          {element.dateWatched && (
            <div className="text-zinc-400">
              Watched on{" "}
              {new Date(element.dateWatched).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
