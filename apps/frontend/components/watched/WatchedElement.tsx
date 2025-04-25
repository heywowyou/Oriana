type WatchedElementProps = {
  _id: string;
  title: string;
  cover?: string;
  rating?: number;
  type: "movie" | "show" | "anime";
};

export default function WatchedElement({
  title,
  cover,
  rating,
  type,
}: WatchedElementProps) {
  return (
    <div className="border rounded-md p-3 flex gap-4 shadow-sm bg-white">
      <img
        src={cover || "/placeholder.jpg"}
        alt={title}
        className="w-20 h-30 object-cover rounded"
      />
      <div className="flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500 capitalize">{type}</p>
        </div>
        {rating != null && <p className="text-sm mt-2">⭐ {rating}/10</p>}
      </div>
    </div>
  );
}
