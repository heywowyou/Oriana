// Specify this component is a client-side component.
"use client";

// Import necessary Lucide icons and types.
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
import { IMediaItem, MediaType } from "@/types/media";

// Map media types to their corresponding small icons for display on the card.
const MEDIA_TYPE_CARD_ICONS: Partial<Record<MediaType, LucideIcon>> = {
  movie: Film,
  show: Tv,
  anime: SquareLibrary,
  book: BookOpen,
  game: Gamepad2,
  music_album: Music2,
};

// Define properties for the MediaItemCard component.
interface MediaItemCardProps {
  item: IMediaItem; // The media item data to display.
  onEdit: (item: IMediaItem) => void; // Callback function when edit is clicked.
  onClick: (item: IMediaItem) => void; // Callback function when card is clicked (to view details).
  onToggleFavorite: (id: string, newStatus: boolean) => void; // Callback for toggling favorite status.
}

// Define the MediaItemCard component.
export default function MediaItemCard({
  item,
  onEdit,
  onClick,
  onToggleFavorite,
}: MediaItemCardProps) {
  // --- Date Formatting ---
  // Determine the date to display (consumed, logged, or created).
  const displayDateSource =
    item.dateConsumed || item.dateLogged || item.createdAt;
  // Format the date string for display (e.g., "Oct 20").
  const formattedDisplayDate = displayDateSource
    ? new Date(displayDateSource).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : ""; // Display nothing if no date is available.

  // --- JSX Return ---
  return (
    <div
      className="flex flex-col items-center w-[160px] sm:w-[180px] gap-3 cursor-default group/card"
      onClick={() => onClick(item)} // Trigger view modal on card click.
      role="button" // Indicate clickable role for accessibility.
      tabIndex={0} // Make it focusable.
      onKeyDown={(event) => {
        // Allow activation with Enter or Space key.
        if (event.key === "Enter" || event.key === " ") onClick(item);
      }}
      aria-label={`View details for ${item.title}`}
    >
      {/* --- Cover Image Section --- */}
      <div className="relative w-full aspect-[2/3] drop-shadow-xl hover:scale-105 transition-transform duration-200 ease-in cursor-pointer">
        {/* Image container with hover scale effect. */}
        <div className="absolute inset-0 ">
          <img
            src={item.cover || "/placeholder.jpg"} // Use item cover or a placeholder.
            alt={`Cover for ${item.title}`}
            className="w-full h-full object-cover rounded-xl"
            onError={(
              event // Fallback image if original fails to load.
            ) =>
              (event.currentTarget.src =
                "https://placehold.co/200x300/333333/FFFFFF?text=No+Image")
            }
          />
        </div>

        {/* Edit button, appears on hover. */}
        <button
          onClick={(event) => {
            event.stopPropagation(); // Prevent card click event from firing.
            onEdit(item); // Trigger edit action.
          }}
          className="absolute top-2 right-2 bg-powder/70 backdrop-blur text-zinc-200 p-2 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity ease-in duration-200 z-10"
          aria-label={`Edit ${item.title}`}
        >
          <Pen className="w-4 h-4" />
        </button>
      </div>

      {/* --- Information Below Image --- */}
      <div className="flex flex-col w-full px-1 gap-1">
        {/* Item title, truncates if too long. */}
        <p
          className="text-sm text-zinc-600 truncate duration-200 ease-in"
          title={item.title} // Show full title on hover.
        >
          {item.title}
        </p>
        <div className="flex items-center justify-between w-full mt-1">
          {/* Rating stars and favorite button. */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Star
                key={starValue}
                className={`w-4 h-4 ${
                  item.rating && item.rating >= starValue
                    ? "text-sky-400 fill-sky-400" // Filled star for rated.
                    : "text-zinc-800 fill-zinc-0" // Empty star.
                }`}
              />
            ))}
            {/* Favorite toggle button. */}
            <button
              onClick={(event) => {
                event.stopPropagation(); // Prevent card click.
                onToggleFavorite(item._id, !item.favorite); // Toggle favorite status.
              }}
              className="ml-1.5 text-zinc-400 hover:text-sky-400 ease-in-out duration-200"
              aria-label={`Toggle ${item.title} as favorite`}
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  item.favorite
                    ? "text-red-500 fill-red-500" // Favorite icon style.
                    : "" // Non-favorite icon style.
                }`}
              />
            </button>
          </div>

          {/* Display formatted date if available. */}
          {formattedDisplayDate && (
            <div className="text-xs text-zinc-600">{formattedDisplayDate}</div>
          )}
        </div>
      </div>
    </div>
  );
}
