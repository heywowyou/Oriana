"use client";

import {
  Star,
  Heart,
  Pen,
  BookOpen,
  Gamepad2,
  Music2,
  Film,
  Tv,
  SquareLibrary,
  LucideIcon,
} from "lucide-react";
import { IMediaItem, MediaType } from "@/types/media"; // Import your shared types

// Define a mapping from MediaType to LucideIcon for a small icon on the card
const MEDIA_TYPE_CARD_ICONS: Partial<Record<MediaType, LucideIcon>> = {
  movie: Film,
  show: Tv,
  anime: SquareLibrary,
  book: BookOpen,
  game: Gamepad2,
  music_album: Music2,
};

interface MediaItemCardProps {
  item: IMediaItem; // Receives the full IMediaItem object
  onEdit: (item: IMediaItem) => void; // Callback when edit is clicked
  onClick: (item: IMediaItem) => void; // Callback when card is clicked (for view modal)
  onToggleFavorite: (id: string, newStatus: boolean) => void; // Callback for favorite toggle
}

export default function MediaItemCard({
  item,
  onEdit,
  onClick,
  onToggleFavorite,
}: MediaItemCardProps) {
  // Use dateConsumed for display, fall back to dateLogged or createdAt if needed for "date added"
  const displayDateString =
    item.dateConsumed || item.dateLogged || item.createdAt;
  const formattedDate = displayDateString
    ? new Date(displayDateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const CardIcon = MEDIA_TYPE_CARD_ICONS[item.mediaType] || SquareLibrary;

  return (
    <div
      className="flex flex-col items-center w-[160px] sm:w-[180px] gap-3 cursor-pointer group/card"
      onClick={() => onClick(item)} // Pass the full item to the onClick handler
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(item);
      }}
      aria-label={`View details for ${item.title}`}
    >
      {/* Image and Edit Button */}
      <div className="relative w-full aspect-[2/3] shadow-lg rounded-lg overflow-hidden">
        {/* Image container with hover effect */}
        <div className="absolute inset-0 group-hover/card:scale-105 transition-transform duration-200 ease-in-out">
          <img
            src={item.cover || "/placeholder.jpg"} // Use a real placeholder if you have one
            alt={`Cover for ${item.title}`}
            className="w-full h-full object-cover rounded-lg"
            // Add Next.js Image component optimization if preferred, but src might need to be handled
            // For external URLs, ensure your next.config.js is configured for image domains
            onError={(e) =>
              (e.currentTarget.src =
                "https://placehold.co/200x300/333333/FFFFFF?text=No+Image")
            } // Basic fallback
          />
        </div>

        {/* Edit button - appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when edit button is clicked
            onEdit(item); // Pass the full item to onEdit
          }}
          className="absolute top-2 right-2 bg-powder/80 backdrop-blur-sm text-zinc-200 hover:text-sky-400 p-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity ease-in-out duration-200 z-10"
          aria-label={`Edit ${item.title}`}
        >
          <Pen className="w-4 h-4" />
        </button>

        {/* Small Media Type Icon */}
        <div className="absolute bottom-2 left-2 bg-powder/80 backdrop-blur-sm text-zinc-200 p-1.5 rounded-full z-10">
          <CardIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Information below image */}
      <div className="flex flex-col w-full px-1">
        <p
          className="text-sm font-semibold text-zinc-200 truncate group-hover/card:text-sky-400 transition-colors"
          title={item.title}
        >
          {item.title}
        </p>
        <div className="flex items-center justify-between w-full mt-1">
          {/* Stars + Favorite */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  item.rating && item.rating >= i
                    ? "text-sky-400 fill-sky-400"
                    : "text-zinc-600 fill-zinc-800/50"
                }`}
              />
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onToggleFavorite(item._id, !item.favorite);
              }}
              className="ml-1.5 text-zinc-500 hover:text-red-500 transition-colors"
              aria-label={`Toggle ${item.title} as favorite`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${
                  item.favorite
                    ? "text-red-500 fill-red-500"
                    : "hover:fill-red-500/30"
                }`}
              />
            </button>
          </div>

          {/* Date (Consumed/Logged) */}
          {formattedDate && (
            <div className="text-xs text-zinc-400">{formattedDate}</div>
          )}
        </div>
      </div>
    </div>
  );
}
