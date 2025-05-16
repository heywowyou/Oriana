// Specify this component is a client-side component.
"use client";

// Import necessary Lucide icons and types.
import {
  X,
  Star,
  CalendarDays,
  Tag,
  Info,
  Edit,
  BookOpen,
  Gamepad2,
  Music2,
  Film,
  Tv,
  SquareLibrary,
  LucideIcon,
  CheckCircle,
  Clock,
  ListChecks,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react"; // Import RefObject, useEffect, useRef, useState
import { IMediaItem, MediaType } from "@/types/media";

// Map media types to their corresponding icons for the modal header.
const MODAL_MEDIA_TYPE_ICONS: Partial<Record<MediaType, LucideIcon>> = {
  movie: Film,
  show: Tv,
  anime: SquareLibrary,
  book: BookOpen,
  game: Gamepad2,
  music_album: Music2,
};

// Explicitly define the type for item status based on IMediaItem.
type DefinedItemStatus = NonNullable<IMediaItem["status"]>;

// Map item status values to their corresponding icons.
const STATUS_ICONS: Partial<Record<DefinedItemStatus, LucideIcon>> = {
  completed: CheckCircle,
  in_progress: Clock,
  planned: ListChecks,
  on_hold: RotateCcw,
  dropped: XCircle,
};

// Define properties for the ViewItemModal component.
interface ViewItemModalProps {
  item: IMediaItem; // The media item data to display.
  onClose: () => void; // Callback function to close the modal.
  modalRef: RefObject<HTMLDivElement | null>; // Ref for click-outside-to-close functionality.
  onEdit: (item: IMediaItem) => void; // Callback to trigger edit mode for the item.
}

// Define the ViewItemModal component.
export default function ViewItemModal({
  item,
  onClose,
  modalRef,
  onEdit,
}: ViewItemModalProps) {
  // --- Refs and State for Dynamic Sizing ---
  const imagePaneRef = useRef<HTMLDivElement | null>(null); // Ref for the left image pane
  const [rightPaneWidth, setRightPaneWidth] = useState<number | string>("auto"); // State for right pane's width

  // --- Effects to Sync Right Pane Width with Left Pane Height ---
  useEffect(() => {
    // Function to update the width of the right pane.
    const updateRightPaneWidth = () => {
      if (imagePaneRef.current) {
        // Set right pane width to be equal to the calculated height of the image pane.
        const imageHeight = imagePaneRef.current.offsetHeight;
        setRightPaneWidth(imageHeight);
      }
    };

    // Call initially and on window resize.
    updateRightPaneWidth();
    window.addEventListener("resize", updateRightPaneWidth);

    // Cleanup event listener on component unmount.
    return () => window.removeEventListener("resize", updateRightPaneWidth);
  }, [item]); // Rerun if item changes, as image might change

  // --- Derived Data and Icon Selection ---
  const currentRating = item.rating ?? 0;
  const ItemTypeIcon = MODAL_MEDIA_TYPE_ICONS[item.mediaType] || Info;
  const CurrentStatusIcon = item.status ? STATUS_ICONS[item.status] : null;

  // --- Helper Functions ---
  const formatDateForDisplay = (dateInput?: string | Date): string => {
    if (!dateInput) return "N/A";
    try {
      return new Date(dateInput).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "Invalid Date";
    }
  };

  const renderDetailRow = (
    label: string,
    value?: string | number | string[] | null,
    IconComponent?: LucideIcon
  ) => {
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      String(value).trim() === ""
    ) {
      return null;
    }
    const displayValue = Array.isArray(value)
      ? value.join(", ")
      : String(value);
    return (
      <div className="flex items-start text-sm">
        {IconComponent && (
          <IconComponent className="w-4 h-4 mr-2 mt-0.5 text-sky-400 flex-shrink-0" />
        )}
        <span className="font-semibold text-zinc-400 mr-2">{label}:</span>
        <span className="text-zinc-200 break-words">{displayValue}</span>
      </div>
    );
  };

  // --- JSX Return ---
  return (
    // Modal backdrop and container.
    <div className="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-[60] p-4">
      {/* Main modal structure: flex row, max width/height, prevent content overflow. */}
      <div
        ref={modalRef}
        className="relative bg-powder text-zinc-300 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-row overflow-hidden"
      >
        {/* Left Side: Cover Image Area. */}
        {/* Define a fixed width proportion (e.g., 40%) and a 2:3 aspect ratio. */}
        {/* flex-shrink-0 prevents it from shrinking. */}
        <div
          ref={imagePaneRef}
          className="w-[40%] flex-shrink-0 bg-black aspect-[2/3]" // Example: 40% width for image
        >
          <img
            src={
              item.cover ||
              "https://placehold.co/400x600/333333/FFFFFF?text=No+Cover"
            }
            alt={`Cover for ${item.title}`}
            // Image fills its 2:3 container, maintaining aspect ratio and cropping if needed.
            className="w-full h-full object-cover"
            onError={(event) =>
              (event.currentTarget.src =
                "https://placehold.co/400x600/333333/FFFFFF?text=No+Cover")
            }
          />
        </div>
        {/* Right Side: Item Details Area. */}
        {/* Width is dynamically set to match the height of the left image pane, creating a square. */}
        {/* Height will match image pane due to flex-row alignment. overflow-y-auto for scrolling. */}
        <div
          style={{
            width:
              typeof rightPaneWidth === "number"
                ? `${rightPaneWidth}px`
                : rightPaneWidth,
          }}
          className="flex-shrink-0 bg-powder p-6 flex flex-col gap-4 overflow-y-auto"
        >
          {/* Modal Header: Title, Type Icon, Close Button. */}
          <div className="flex justify-between items-start mb-1 flex-shrink-0">
            {" "}
            {/* Reduced bottom margin */}
            <div className="flex items-center gap-2 min-w-0">
              {" "}
              {/* Reduced gap */}
              <ItemTypeIcon className="w-6 h-6 text-sky-400 flex-shrink-0" />{" "}
              {/* Slightly smaller icon */}
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 break-words mr-2">
                {" "}
                {/* Smaller title */}
                {item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-sky-400 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" /> {/* Slightly smaller close icon */}
            </button>
          </div>
          {/* Scrollable content starts here */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1">
            {" "}
            {/* Added padding-right for scrollbar */}
            {/* Display rating stars if rating is available and greater than 0. */}
            {item.rating !== undefined && item.rating > 0 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    className={`w-5 h-5 ${
                      // Smaller stars
                      currentRating >= starValue
                        ? "text-sky-400 fill-sky-400"
                        : "text-zinc-800 fill-zinc-0"
                    }`}
                  />
                ))}
                {/* Smaller text */}
              </div>
            )}
            {/* Display status information if available. */}
            {item.status && (
              <div className="flex items-center text-xs mt-1">
                {" "}
                {/* Smaller text, margin top */}
                {CurrentStatusIcon && (
                  <CurrentStatusIcon className="w-3 h-3 mr-1 text-sky-400 flex-shrink-0" />
                )}
                <span className="font-semibold text-zinc-400 mr-1">
                  Status:
                </span>
                <span className="text-zinc-200 capitalize">
                  {item.status.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {/* Common Details Section: Dates, Tags. */}
            <div className="space-y-2 py-2 border-y border-zinc-700/50">
              {" "}
              {/* Reduced padding/margins */}
              {renderDetailRow(
                "Consumed",
                formatDateForDisplay(item.dateConsumed),
                CalendarDays
              )}
              {renderDetailRow(
                "Released",
                formatDateForDisplay(item.releaseDate),
                CalendarDays
              )}
              {renderDetailRow(
                "Logged",
                formatDateForDisplay(item.dateLogged),
                CalendarDays
              )}
              {renderDetailRow("Tags", item.tags, Tag)}
            </div>
            {/* Media Type Specific Details Section. */}
            <div className="space-y-2 py-2">
              {" "}
              {/* Reduced padding */}
              {item.mediaType === "movie" && (
                <>
                  {renderDetailRow("Director", item.director)}
                  {renderDetailRow(
                    "Runtime",
                    item.runtimeMinutes
                      ? `${item.runtimeMinutes} mins`
                      : undefined
                  )}
                </>
              )}
              {(item.mediaType === "show" || item.mediaType === "anime") && (
                <>
                  {renderDetailRow("Director", item.director)}
                  {renderDetailRow("Seasons", item.seasonCount)}
                  {renderDetailRow("Episodes", item.episodeCount)}
                </>
              )}
              {/* ... other media types ... */}
            </div>
            {/* Display notes or review if available. */}
            {item.notes && (
              <div className="space-y-2 py-2 border-t border-zinc-700/50">
                {" "}
                {/* Reduced padding/margins */}
                <h3 className="text-sm font-semibold text-sky-400">
                  Notes & Review
                </h3>{" "}
                {/* Smaller heading */}
                <p className="text-xs text-zinc-300 whitespace-pre-wrap bg-ashe/30 p-2 rounded-md">
                  {" "}
                  {/* Smaller text, padding */}
                  {item.notes}
                </p>
              </div>
            )}
          </div>{" "}
          {/* End of scrollable content div */}
          {/* Action Buttons Area. */}
          <div className="pt-2 flex justify-end gap-2 flex-shrink-0">
            {" "}
            {/* Reduced padding, gap */}
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-3 py-1.5 text-xs rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1.5" // Smaller button
            >
              <Edit className="w-3 h-3" /> Edit {/* Smaller icon */}
            </button>
          </div>
        </div>{" "}
        {/* End of Right Details Pane */}
      </div>{" "}
      {/* End of Main Modal Structure */}
    </div> // End of Modal Backdrop
  );
}
