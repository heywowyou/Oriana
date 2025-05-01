import { Star, Heart, Pen } from "lucide-react";

type WatchedElementProps = {
  _id: string;
  title: string;
  cover?: string;
  rating?: number;
  type: "movie" | "show" | "anime";
  favorite?: boolean;
  dateWatched?: string;
  onEdit?: (element: WatchedElementProps) => void;
  onClick?: (element: WatchedElementProps) => void;
  onToggleFavorite?: (id: string, newStatus: boolean) => void;
};

export default function WatchedElement({
  _id,
  title,
  cover,
  rating,
  type,
  favorite,
  dateWatched,
  onEdit,
  onClick,
  onToggleFavorite,
}: WatchedElementProps) {
  const formattedDate = dateWatched
    ? new Date(dateWatched).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div
      className="flex flex-col items-center w-[160px] gap-3 cursor-pointer"
      onClick={() =>
        onClick?.({ _id, title, cover, rating, type, favorite, dateWatched })
      }
    >
      {/* Image */}
      <div className="relative w-full aspect-[2/3] shadow-lg group">
        <div className="absolute inset-0 rounded-lg overflow-visible group-hover:scale-105 ease-in-out duration-200">
          <img
            src={cover || "/placeholder.jpg"}
            alt={title}
            className="w-full h-full rounded-lg object-cover"
          />
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.({
                _id,
                title,
                cover,
                rating,
                type,
                favorite,
                dateWatched,
              });
            }}
            className="absolute top-2 right-2 bg-powder text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 ease-in-out duration-200"
            aria-label="Edit"
          >
            <Pen className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between w-full">
        {/* Stars + Favorite */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                rating && rating >= i
                  ? "text-sky-400 fill-sky-400"
                  : "text-zinc-800 fill-powder"
              }`}
            />
          ))}

          {/* Favorite Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(_id, !favorite);
            }}
            className="ml-1"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-4 h-4 transition ${
                favorite ? "text-red-500 fill-red-500" : "text-zinc-400"
              }`}
            />
          </button>
        </div>

        {/* Date watched */}
        <div className="text-xs text-light text-zinc-400">{formattedDate}</div>
      </div>
    </div>
  );
}
