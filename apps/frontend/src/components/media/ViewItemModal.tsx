"use client";

import {
  X,
  Star,
  CalendarDays,
  Tag,
  Info,
  Edit,
  Trash2,
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
import { RefObject } from "react";
import { IMediaItem, MediaType } from "@/types/media";

// Define a mapping from MediaType to LucideIcon for the modal header
const MODAL_MEDIA_TYPE_ICONS: Partial<Record<MediaType, LucideIcon>> = {
  movie: Film,
  show: Tv,
  anime: SquareLibrary,
  book: BookOpen,
  game: Gamepad2,
  music_album: Music2,
};

// Define the type for status strings explicitly from IMediaItem['status']
type DefinedItemStatus = NonNullable<IMediaItem["status"]>;

// Define a mapping for status icons using the DefinedItemStatus type
const STATUS_ICONS: Partial<Record<DefinedItemStatus, LucideIcon>> = {
  completed: CheckCircle,
  in_progress: Clock,
  planned: ListChecks,
  on_hold: RotateCcw,
  dropped: XCircle,
};

interface ViewItemModalProps {
  item: IMediaItem; // Receives the full IMediaItem object
  onClose: () => void;
  modalRef: RefObject<HTMLDivElement | null>; // For click outside to close
  onEdit: (item: IMediaItem) => void; // Callback to trigger edit mode
  // Add onDelete if delete button needed in the modal
}

export default function ViewItemModal({
  item,
  onClose,
  modalRef,
  onEdit,
}: ViewItemModalProps) {
  const rating = item.rating ?? 0;
  const ItemIcon = MODAL_MEDIA_TYPE_ICONS[item.mediaType] || Info;

  const StatusIcon = item.status ? STATUS_ICONS[item.status] : null;

  const formatDate = (dateInput?: string | Date): string => {
    if (!dateInput) return "N/A";
    try {
      return new Date(dateInput).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const renderDetail = (
    label: string,
    value?: string | number | string[] | null,
    Icon?: LucideIcon
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
      : value.toString();
    return (
      <div className="flex items-start text-sm">
        {Icon && (
          <Icon className="w-4 h-4 mr-2 mt-0.5 text-sky-400 flex-shrink-0" />
        )}
        <span className="font-semibold text-zinc-400 mr-2">{label}:</span>
        <span className="text-zinc-200">{displayValue}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div
        ref={modalRef}
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
            onError={(e) =>
              (e.currentTarget.src =
                "https://placehold.co/400x600/333333/FFFFFF?text=No+Cover")
            }
          />
        </div>

        {/* Right Side: Details */}
        <div className="w-full sm:w-2/3 p-6 flex flex-col gap-3 overflow-y-auto">
          {/* Header with Title, Type Icon, and Close Button */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <ItemIcon className="w-7 h-7 text-sky-400 flex-shrink-0" />
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

          {/* Rating */}
          {item.rating !== undefined && item.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    rating >= i
                      ? "text-sky-400 fill-sky-400"
                      : "text-zinc-600 fill-zinc-800/30"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-zinc-400">({rating}/5)</span>
            </div>
          )}

          {/* Status */}
          {item.status && (
            <div className="flex items-center text-sm mb-2">
              {StatusIcon && (
                <StatusIcon className="w-4 h-4 mr-2 text-sky-400 flex-shrink-0" />
              )}
              <span className="font-semibold text-zinc-400 mr-2">Status:</span>
              <span className="text-zinc-200 capitalize">
                {item.status.replace("_", " ")}
              </span>
            </div>
          )}

          {/* Common Details Section */}
          <div className="space-y-2.5 py-2 border-y border-zinc-700/50 my-2">
            {renderDetail(
              "Consumed On",
              formatDate(item.dateConsumed),
              CalendarDays
            )}
            {renderDetail(
              "Released On",
              formatDate(item.releaseDate),
              CalendarDays
            )}
            {renderDetail(
              "Logged On",
              formatDate(item.dateLogged),
              CalendarDays
            )}
            {renderDetail("Tags", item.tags, Tag)}
          </div>

          {/* Media Type Specific Details */}
          <div className="space-y-2.5 py-2">
            {item.mediaType === "movie" && (
              <>
                {renderDetail("Director", item.director)}
                {renderDetail(
                  "Runtime",
                  item.runtimeMinutes
                    ? `${item.runtimeMinutes} mins`
                    : undefined
                )}
              </>
            )}
            {(item.mediaType === "show" || item.mediaType === "anime") && (
              <>
                {renderDetail("Director", item.director)}
                {renderDetail("Seasons", item.seasonCount)}
                {renderDetail("Episodes", item.episodeCount)}
              </>
            )}
            {item.mediaType === "book" && (
              <>
                {renderDetail("Authors", item.authors)}
                {renderDetail("Pages", item.pageCount)}
                {renderDetail("Publisher", item.publisher)}
                {renderDetail("ISBN", item.isbn)}
              </>
            )}
            {item.mediaType === "game" && (
              <>
                {renderDetail("Platforms", item.platforms)}
                {renderDetail("Developers", item.developers)}
                {renderDetail("Publisher", item.gamePublisher)}
                {renderDetail("Hours Played", item.hoursPlayed)}
              </>
            )}
            {item.mediaType === "music_album" && (
              <>
                {renderDetail("Artist", item.artist)}
                {renderDetail("Genres", item.musicGenre)}
                {renderDetail("Tracks", item.trackCount)}
                {renderDetail("Label", item.recordLabel)}
              </>
            )}
          </div>

          {/* Notes/Review */}
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

          {/* Action Buttons */}
          <div className="mt-auto pt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                onClose(); // Close this modal first
                onEdit(item); // Then trigger the edit modal
              }}
              className="px-4 py-2 text-sm rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            {/* Add Delete button if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
