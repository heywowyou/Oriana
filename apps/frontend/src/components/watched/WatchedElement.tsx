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
}: WatchedElementProps) {
  return (
    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden group">
      <img
        src={cover || "/placeholder.jpg"}
        alt={title}
        className="w-full h-full object-cover transition duration-200"
      />
    </div>
  );
}
