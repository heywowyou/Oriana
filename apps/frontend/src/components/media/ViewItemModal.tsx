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
import { RefObject } from "react"; // Import RefObject for modal ref.
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
  // --- Derived Data and Icon Selection ---
  // Default rating to 0 if undefined.
  const currentRating = item.rating ?? 0;
  // Select the appropriate icon for the media type, defaulting to Info icon.
  const ItemTypeIcon = MODAL_MEDIA_TYPE_ICONS[item.mediaType] || Info;
  // Select the appropriate icon for the item's status, if status exists.
  const CurrentStatusIcon = item.status ? STATUS_ICONS[item.status] : null;

  // --- Helper Functions ---
  // Format a date string or Date object for display.
  const formatDateForDisplay = (dateInput?: string | Date): string => {
    if (!dateInput) return "N/A"; // Return "N/A" if date is not available.
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

  // Render a detail row if the value is present.
  const renderDetailRow = (
    label: string,
    value?: string | number | string[] | null,
    IconComponent?: LucideIcon // Optional icon for the detail row.
  ) => {
    // Do not render if value is undefined, null, an empty array, or an empty string.
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      String(value).trim() === ""
    ) {
      return null;
    }
    // Join array values into a comma-separated string.
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div
        ref={modalRef} // Attach ref for click-outside detection.
        className="relative bg-powder text-zinc-300 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col sm:flex-row overflow-hidden"
      >
        {/* Left Side: Cover Image */}
        <div className="w-full sm:w-1/3 h-64 sm:h-auto bg-black flex-shrink-0">
          <img
            src={
              item.cover ||
              "https://placehold.co/400x600/333333/FFFFFF?text=No+Cover"
            }
            alt={`Cover for ${item.title}`}
            className="w-full h-full object-cover"
            onError={(
              event // Fallback image.
            ) =>
              (event.currentTarget.src =
                "https://placehold.co/400x600/333333/FFFFFF?text=No+Cover")
            }
          />
        </div>

        {/* Right Side: Item Details */}
        <div className="w-full sm:w-2/3 p-6 flex flex-col gap-3 overflow-y-auto">
          {/* Modal Header: Title, Type Icon, Close Button */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <ItemTypeIcon className="w-7 h-7 text-sky-400 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 break-words mr-8">
                {item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-sky-400 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Rating Stars */}
          {item.rating !== undefined && item.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Star
                  key={starValue}
                  className={`w-5 h-5 ${
                    currentRating >= starValue
                      ? "text-sky-400 fill-sky-400"
                      : "text-zinc-600 fill-zinc-800/30"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-zinc-400">
                ({currentRating}/5)
              </span>
            </div>
          )}

          {/* Status Information */}
          {item.status && (
            <div className="flex items-center text-sm mb-2">
              {CurrentStatusIcon && (
                <CurrentStatusIcon className="w-4 h-4 mr-2 text-sky-400 flex-shrink-0" />
              )}
              <span className="font-semibold text-zinc-400 mr-2">Status:</span>
              <span className="text-zinc-200 capitalize">
                {item.status.replace(/_/g, " ")}{" "}
                {/* Format status string for display */}
              </span>
            </div>
          )}

          {/* Common Details Section (Dates, Tags) */}
          <div className="space-y-2.5 py-2 border-y border-zinc-700/50 my-2">
            {renderDetailRow(
              "Consumed On",
              formatDateForDisplay(item.dateConsumed),
              CalendarDays
            )}
            {renderDetailRow(
              "Released On",
              formatDateForDisplay(item.releaseDate),
              CalendarDays
            )}
            {renderDetailRow(
              "Logged On",
              formatDateForDisplay(item.dateLogged),
              CalendarDays
            )}
            {renderDetailRow("Tags", item.tags, Tag)}
          </div>

          {/* Media Type Specific Details Section */}
          <div className="space-y-2.5 py-2">
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
            {item.mediaType === "book" && (
              <>
                {renderDetailRow("Authors", item.authors)}
                {renderDetailRow("Pages", item.pageCount)}
                {renderDetailRow("Publisher", item.publisher)}
                {renderDetailRow("ISBN", item.isbn)}
              </>
            )}
            {item.mediaType === "game" && (
              <>
                {renderDetailRow("Platforms", item.platforms)}
                {renderDetailRow("Developers", item.developers)}
                {renderDetailRow("Publisher", item.gamePublisher)}
                {renderDetailRow("Hours Played", item.hoursPlayed)}
              </>
            )}
            {item.mediaType === "music_album" && (
              <>
                {renderDetailRow("Artist", item.artist)}
                {renderDetailRow("Genres", item.musicGenre)}
                {renderDetailRow("Tracks", item.trackCount)}
                {renderDetailRow("Label", item.recordLabel)}
              </>
            )}
          </div>

          {/* Notes/Review Section */}
          {item.notes && (
            <div className="mt-2 pt-3 border-t border-zinc-700/50">
              <h3 className="text-md font-semibold text-sky-400 mb-1.5">
                Notes/Review
              </h3>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-ashe/30 p-3 rounded-md">
                {item.notes}
              </p>
            </div>
          )}

          {/* Action Buttons (Edit) */}
          <div className="mt-auto pt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                onClose(); // Close this view modal.
                onEdit(item); // Trigger the edit modal.
              }}
              className="px-4 py-2 text-sm rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            {/* Placeholder for a potential Delete button */}
          </div>
        </div>
      </div>
    </div>
  );
}
