import { Star, Heart } from "lucide-react";

type WatchedElementProps = {
  _id: string;
  title: string;
  cover?: string;
  rating?: number;
  type: "movie" | "show" | "anime";
  favorite?: boolean;
  dateWatched?: string;
  onEdit?: (element: WatchedElementProps) => void;
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
}: WatchedElementProps) {
  // Format date
  const formattedDate = dateWatched
    ? new Date(dateWatched).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col items-center w-[160px]">
      {/* Image */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden group">
        <img
          src={cover || "/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover transition duration-200"
        />

        {/* Edit button (appears on hover only if onEdit is provided) */}
        {onEdit && (
          <button
            onClick={() =>
              onEdit({ _id, title, cover, rating, type, favorite })
            }
            className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex items-center justify-between w-full mt-2 text-gray-400">
        {/* Stars and Heart */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                rating && rating >= i
                  ? "text-zinc-400 fill-zinc-400"
                  : "text-zinc-800 fill-zinc-800"
              }`}
            />
          ))}

          {/* Favorite Heart */}
          {favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
        </div>

        {/* Date watched */}
        <div className="text-sm text-light">{formattedDate}</div>
      </div>
    </div>
  );
}
