// Specify this component is a client-side component.
"use client";

// Import necessary icons and types.
import { Star } from "lucide-react";
import { IMediaItem, MediaType } from "@/types/media"; // MEDIA_TYPES_FRONTEND was not used, removed.

// Define properties for the MediaFormFields component.
interface MediaFormFieldsProps {
  formData: Partial<IMediaItem>; // Current state of the form data.
  setFormData: <K extends keyof IMediaItem>( // Function to update form data.
    fieldName: K,
    value: IMediaItem[K]
  ) => void;
  currentMediaType: MediaType; // The primary media type being handled.
  availableSubTypes?: MediaType[]; // Subtypes user can select from, if applicable.
  uploading: boolean; // Image upload status.
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler for file input change.
  isEditMode?: boolean; // Flag to indicate if the form is in edit mode.
}

// Define the MediaFormFields component.
export default function MediaFormFields({
  formData,
  setFormData,
  currentMediaType,
  availableSubTypes = [],
  uploading,
  handleFileChange,
  isEditMode = false,
}: MediaFormFieldsProps) {
  // --- Input Change Handler ---
  // Handle changes for most standard input, textarea, and select elements.
  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;
    let processedValue: any = value;

    // Process number inputs.
    if (type === "number") {
      processedValue = value === "" ? undefined : parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = undefined; // Or keep as empty string if controlled input needs it.
      }
    }

    // Process comma-separated string inputs into arrays for specific fields.
    const arrayInputFields = [
      "tags",
      "authors",
      "platforms",
      "developers",
      "musicGenre",
    ];
    if (arrayInputFields.includes(name)) {
      processedValue = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }

    setFormData(name as keyof IMediaItem, processedValue);
  };

  // --- Rating Change Handler ---
  // Handle clicks on rating stars.
  const handleRatingChange = (newRating: number) => {
    // Allow deselecting rating to 0 if the same star is clicked again.
    const finalRating = newRating === formData.rating ? 0 : newRating;
    setFormData("rating", finalRating);
  };

  // --- Media Type Change Handler ---
  // Handle selection of a different media subtype.
  const handleMediaTypeChange = (newType: MediaType) => {
    setFormData("mediaType", newType);
    // Note: Parent form (LogItemForm/EditItemForm) manages clearing/adjusting other fields if necessary.
  };

  // --- Date Formatting Helper ---
  // Format date string or Date object to 'YYYY-MM-DD' for date input fields.
  const formatDateForInput = (dateValue?: string | Date): string => {
    if (!dateValue) return "";
    try {
      // Ensure the date is treated as UTC to avoid timezone shifts when splitting.
      const dateObj = new Date(dateValue);
      if (
        typeof dateValue === "string" &&
        !dateValue.includes("T") &&
        !dateValue.includes("Z")
      ) {
        // If it's a plain date string like "2023-10-20", create Date as UTC.
        const [year, month, day] = dateValue.split("-").map(Number);
        return new Date(Date.UTC(year, month - 1, day))
          .toISOString()
          .split("T")[0];
      }
      return dateObj.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return ""; // Return empty or handle invalid date strings appropriately.
    }
  };

  // --- JSX Return ---
  return (
    <>
      {/* --- Common Fields Applicable to All Media Types --- */}
      <div>
        <label htmlFor="title" className="block text-sm text-zinc-400 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleInputChange}
          required
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label
          htmlFor="cover"
          className="block text-sm text-zinc-400 mb-1 mt-4"
        >
          Cover URL
        </label>
        <input
          id="cover"
          name="cover"
          value={formData.cover || ""}
          onChange={handleInputChange}
          placeholder="Paste an image URL or upload a file"
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <div className="flex items-center gap-3">
          {/* Button to trigger file input. */}
          <label
            htmlFor="cover-upload"
            className="px-4 py-2 text-zinc-400 ring ring-sky-400 hover:scale-105 shadow-lg rounded-lg cursor-pointer ease-in-out duration-200"
          >
            Upload Image
          </label>
          {/* Hidden file input. */}
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading && (
            <span className="text-sm text-zinc-400">Uploading...</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1 mt-4">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              key={starValue}
              type="button" // Prevent form submission.
              onClick={() => handleRatingChange(starValue)}
              className="text-zinc-800 hover:scale-110 ease-in-out duration-200"
              aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-6 h-6 stroke-1 ${
                  (formData.rating || 0) >= starValue
                    ? "text-sky-400 fill-sky-400"
                    : "fill-powder stroke-zinc-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* --- Media SubType Selection UI --- */}
      {/* Display if multiple subtypes are available (e.g., movie/show/anime). */}
      {availableSubTypes && availableSubTypes.length > 1 && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1 mt-4">
            Specific Type
          </label>
          <div className="flex flex-wrap gap-3">
            {availableSubTypes.map((subTypeOption) => (
              <button
                key={subTypeOption}
                type="button" // Prevent form submission.
                onClick={() => handleMediaTypeChange(subTypeOption)}
                className={`px-4 py-2 rounded-lg hover:scale-105 ease-in-out duration-200 ${
                  currentMediaType === subTypeOption
                    ? "bg-sky-400 text-powder" // Active style.
                    : "text-zinc-400 ring ring-ashe hover:ring-sky-400" // Inactive style.
                }`}
              >
                {/* Capitalize and format subtype name for display. */}
                {subTypeOption.charAt(0).toUpperCase() +
                  subTypeOption.slice(1).replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Display current media type if it's fixed (not selectable from subtypes). */}
      {(!availableSubTypes || availableSubTypes.length <= 1) && (
        <div>
          <p className="text-sm text-zinc-400 mt-4">
            Type:{" "}
            <span className="font-semibold text-zinc-300">
              {currentMediaType.charAt(0).toUpperCase() +
                currentMediaType.slice(1).replace(/_/g, " ")}
            </span>
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="dateConsumed"
          className="block text-sm text-zinc-400 mb-1 mt-4"
        >
          Date Consumed
        </label>
        <input
          id="dateConsumed"
          name="dateConsumed"
          type="date"
          value={formatDateForInput(formData.dateConsumed)}
          onChange={handleInputChange}
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm text-zinc-400 mb-1 mt-4"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status || ""}
          onChange={handleInputChange}
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="">Select Status (Optional)</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="planned">Planned</option>
          <option value="on_hold">On Hold</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm text-zinc-400 mb-1 mt-4"
        >
          Notes/Review
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleInputChange}
          rows={3}
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Your personal notes or a short review..."
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm text-zinc-400 mb-1 mt-4">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
          onChange={handleInputChange}
          placeholder="e.g., sci-fi, favorite, mind-bending"
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label
          htmlFor="releaseDate"
          className="block text-sm text-zinc-400 mb-1 mt-4"
        >
          Release Date
        </label>
        <input
          id="releaseDate"
          name="releaseDate"
          type="date"
          value={formatDateForInput(formData.releaseDate)}
          onChange={handleInputChange}
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* --- Media Type Specific Fields --- */}
      {/* Conditionally render fields based on the currentMediaType. */}

      {currentMediaType === "book" && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <h3 className="text-md font-semibold text-sky-400 mb-2">
            Book Details
          </h3>
          <div>
            <label
              htmlFor="authors"
              className="block text-sm text-zinc-400 mb-1"
            >
              Authors (comma-separated)
            </label>
            <input
              id="authors"
              name="authors"
              value={
                Array.isArray(formData.authors)
                  ? formData.authors.join(", ")
                  : ""
              }
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="pageCount"
              className="block text-sm text-zinc-400 mb-1"
            >
              Page Count
            </label>
            <input
              id="pageCount"
              name="pageCount"
              type="number"
              value={formData.pageCount || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="publisher"
              className="block text-sm text-zinc-400 mb-1"
            >
              Publisher
            </label>
            <input
              id="publisher"
              name="publisher"
              value={formData.publisher || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label htmlFor="isbn" className="block text-sm text-zinc-400 mb-1">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              value={formData.isbn || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
      )}

      {currentMediaType === "game" && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <h3 className="text-md font-semibold text-sky-400 mb-2">
            Game Details
          </h3>
          <div>
            <label
              htmlFor="platforms"
              className="block text-sm text-zinc-400 mb-1"
            >
              Platforms (comma-separated)
            </label>
            <input
              id="platforms"
              name="platforms"
              value={
                Array.isArray(formData.platforms)
                  ? formData.platforms.join(", ")
                  : ""
              }
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="e.g., PC, PS5, Nintendo Switch"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="developers"
              className="block text-sm text-zinc-400 mb-1"
            >
              Developers (comma-separated)
            </label>
            <input
              id="developers"
              name="developers"
              value={
                Array.isArray(formData.developers)
                  ? formData.developers.join(", ")
                  : ""
              }
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="gamePublisher"
              className="block text-sm text-zinc-400 mb-1"
            >
              Publisher (Game)
            </label>
            <input
              id="gamePublisher"
              name="gamePublisher"
              value={formData.gamePublisher || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="hoursPlayed"
              className="block text-sm text-zinc-400 mb-1"
            >
              Hours Played
            </label>
            <input
              id="hoursPlayed"
              name="hoursPlayed"
              type="number"
              value={formData.hoursPlayed || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
      )}

      {(currentMediaType === "movie" ||
        currentMediaType === "show" ||
        currentMediaType === "anime") && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <h3 className="text-md font-semibold text-sky-400 mb-2">
            {/* Dynamically set heading based on media type. */}
            {currentMediaType === "movie" && "Movie Details"}
            {currentMediaType === "show" && "Show Details"}
            {currentMediaType === "anime" && "Anime Details"}
          </h3>
          <div>
            <label
              htmlFor="director"
              className="block text-sm text-zinc-400 mb-1"
            >
              Director
            </label>
            <input
              id="director"
              name="director"
              value={formData.director || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="runtimeMinutes"
              className="block text-sm text-zinc-400 mb-1"
            >
              Runtime (Minutes)
            </label>
            <input
              id="runtimeMinutes"
              name="runtimeMinutes"
              type="number"
              value={formData.runtimeMinutes || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          {/* Fields specific to shows and anime. */}
          {(currentMediaType === "show" || currentMediaType === "anime") && (
            <>
              <div className="mt-3">
                <label
                  htmlFor="seasonCount"
                  className="block text-sm text-zinc-400 mb-1"
                >
                  Season Count
                </label>
                <input
                  id="seasonCount"
                  name="seasonCount"
                  type="number"
                  value={formData.seasonCount || ""}
                  onChange={handleInputChange}
                  className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div className="mt-3">
                <label
                  htmlFor="episodeCount"
                  className="block text-sm text-zinc-400 mb-1"
                >
                  Episode Count
                </label>
                <input
                  id="episodeCount"
                  name="episodeCount"
                  type="number"
                  value={formData.episodeCount || ""}
                  onChange={handleInputChange}
                  className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </>
          )}
        </div>
      )}

      {currentMediaType === "music_album" && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <h3 className="text-md font-semibold text-sky-400 mb-2">
            Music Album Details
          </h3>
          <div>
            <label
              htmlFor="artist"
              className="block text-sm text-zinc-400 mb-1"
            >
              Artist
            </label>
            <input
              id="artist"
              name="artist"
              value={formData.artist || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="musicGenre"
              className="block text-sm text-zinc-400 mb-1"
            >
              Genres (comma-separated)
            </label>
            <input
              id="musicGenre"
              name="musicGenre"
              value={
                Array.isArray(formData.musicGenre)
                  ? formData.musicGenre.join(", ")
                  : ""
              }
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="trackCount"
              className="block text-sm text-zinc-400 mb-1"
            >
              Track Count
            </label>
            <input
              id="trackCount"
              name="trackCount"
              type="number"
              value={formData.trackCount || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="recordLabel"
              className="block text-sm text-zinc-400 mb-1"
            >
              Record Label
            </label>
            <input
              id="recordLabel"
              name="recordLabel"
              value={formData.recordLabel || ""}
              onChange={handleInputChange}
              className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
      )}

      {/* Display read-only Date Logged field in edit mode if available. */}
      {isEditMode && formData.dateLogged && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <label className="block text-sm text-zinc-400 mb-1">
            Date Logged (Read-only)
          </label>
          <input
            type="text" // Display as text, not date input, for read-only formatted date.
            value={new Date(formData.dateLogged).toLocaleDateString("en-CA", {
              // 'en-CA' for YYYY-MM-DD.
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
            readOnly
            className="w-full bg-zinc-700/50 text-zinc-400 rounded px-3 py-2 cursor-not-allowed"
          />
        </div>
      )}
    </>
  );
}
