type WatchedElementProps = {
  _id: string;
  title: string;
  cover?: string;
  rating?: number;
  type: "movie" | "show" | "anime";
  onEdit?: (element: WatchedElementProps) => void;
};

export default function WatchedElement({
  _id,
  title,
  cover,
  rating,
  type,
  onEdit,
}: WatchedElementProps) {
  return (
    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden group">
      <img
        src={cover || "/placeholder.jpg"}
        alt={title}
        className="w-full h-full object-cover transition duration-200"
      />

      {/* Edit button (appears on hover only if onEdit is provided) */}
      {onEdit && (
        <button
          onClick={() => onEdit({ _id, title, cover, rating, type })}
          className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
        >
          Edit
        </button>
      )}
    </div>
  );
}
