"use client";

import { Star } from "lucide-react";
import { IMediaItem, MediaType, MEDIA_TYPES_FRONTEND } from "@/types/media";

// Props for the generic form fields component
interface MediaFormFieldsProps {
  formData: Partial<IMediaItem>; // The current state of the form data
  // Unified function to update any field in the formData
  setFormData: <K extends keyof IMediaItem>(
    fieldName: K,
    value: IMediaItem[K]
  ) => void;
  // The media type currently being edited/created (e.g., "movie", "book")
  // This determines which specific fields are shown.
  // This will typically be pre-set by the parent form (LogItemForm/EditItemForm)
  // based on the section (e.g., "book" if adding a new book).
  currentMediaType: MediaType;
  // If the form allows changing the mediaType (e.g., within a "Watched" section for movie/show/anime)
  // these are the types the user can select from.
  // If the mediaType is fixed (e.g., on a dedicated "Add Book" page), this can be an empty array or not used.
  availableSubTypes?: MediaType[];
  uploading: boolean; // For image upload status
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditMode?: boolean; // To conditionally display certain fields like dateLogged
}

export default function MediaFormFields({
  formData,
  setFormData,
  currentMediaType, // This is the primary type being handled by the form instance
  availableSubTypes = [], // e.g. ["movie", "show", "anime"] if choosing subtype within a category
  uploading,
  handleFileChange,
  isEditMode = false,
}: MediaFormFieldsProps) {
  // Generic handler for most input types
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = undefined; // Or handle as an error, or keep as empty string for controlled input
      }
    }
    // For array fields like tags, if you use a simple text input:
    if (name === "tags" || name === "authors" || name === "platforms" || name === "developers" || name === "musicGenre") {
        // Assuming comma-separated string for array inputs for simplicity here
        // A more robust solution would use a dedicated tag input component
        processedValue = value.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    }

    setFormData(name as keyof IMediaItem, processedValue);
  };

  const handleRatingChange = (newRating: number) => {
    setFormData("rating", newRating === formData.rating ? 0 : newRating); // Allow deselecting to 0
  };

  const handleMediaTypeChange = (newType: MediaType) => {
    // When mediaType changes, we might want to clear specific fields from other types.
    // However, the parent form (LogItemForm/EditItemForm) will manage the full formData object.
    // This component just signals the change.
    setFormData("mediaType", newType);
  };

  // Helper to get date in YYYY-MM-DD format for date inputs
  const formatDateForInput = (date?: string | Date): string => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch (e) {
      return ""; // Handle invalid date strings if necessary
    }
  };


  return (
    <>
      {/* Common Fields */}
      <div>
        <label htmlFor="title" className="block text-sm text-zinc-400 mb-1">Title</label>
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
        <label htmlFor="cover" className="block text-sm text-zinc-400 mb-1 mt-4">Cover URL</label>
        <input
          id="cover"
          name="cover"
          value={formData.cover || ""}
          onChange={handleInputChange}
          placeholder="Paste an image URL or upload a file"
          className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <div className="flex items-center gap-3">
          <label
            htmlFor="cover-upload"
            className="px-4 py-2 text-zinc-400 ring ring-sky-400 hover:scale-105 shadow-lg rounded-lg cursor-pointer ease-in-out duration-200"
          >
            Upload Image
          </label>
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
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="text-zinc-800 hover:scale-110 ease-in-out duration-200"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 ${
                  (formData.rating || 0) >= star
                    ? "text-sky-400 fill-sky-400"
                    : "fill-powder stroke-zinc-600"
                } stroke-1`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* SubType Selection (e.g., Movie/Show/Anime within "Watched" category) */}
      {/* Only show if there are subtypes defined for this context and currentMediaType isn't fixed */}
      {availableSubTypes && availableSubTypes.length > 1 && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1 mt-4">Specific Type</label>
          <div className="flex flex-wrap gap-3">
            {availableSubTypes.map((subTypeOption) => (
              <button
                key={subTypeOption}
                type="button"
                onClick={() => handleMediaTypeChange(subTypeOption)}
                className={`px-4 py-2 rounded-lg hover:scale-105 ease-in-out duration-200 ${
                  currentMediaType === subTypeOption // formData.mediaType should reflect this
                    ? "bg-sky-400 text-powder"
                    : "text-zinc-400 ring ring-ashe hover:ring-sky-400"
                }`}
              >
                {subTypeOption.charAt(0).toUpperCase() + subTypeOption.slice(1).replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* If currentMediaType is fixed (e.g. adding a "Book"), display it as read-only info */}
      {(!availableSubTypes || availableSubTypes.length <= 1) && (
         <div>
            <p className="text-sm text-zinc-400 mt-4">
                Type: <span className="font-semibold text-zinc-300">{currentMediaType.charAt(0).toUpperCase() + currentMediaType.slice(1).replace(/_/g, " ")}</span>
            </p>
         </div>
      )}


      <div>
        <label htmlFor="dateConsumed" className="block text-sm text-zinc-400 mb-1 mt-4">Date Consumed</label>
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
        <label htmlFor="status" className="block text-sm text-zinc-400 mb-1 mt-4">Status</label>
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
        <label htmlFor="notes" className="block text-sm text-zinc-400 mb-1 mt-4">Notes/Review</label>
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
        <label htmlFor="tags" className="block text-sm text-zinc-400 mb-1 mt-4">Tags (comma-separated)</label>
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
        <label htmlFor="releaseDate" className="block text-sm text-zinc-400 mb-1 mt-4">Release Date</label>
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
      {/* Shown based on currentMediaType passed from parent form */}

      {currentMediaType === "book" && (
        <>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <h3 className="text-md font-semibold text-sky-400 mb-2">Book Details</h3>
            <div>
              <label htmlFor="authors" className="block text-sm text-zinc-400 mb-1">Authors (comma-separated)</label>
              <input
                id="authors"
                name="authors"
                value={Array.isArray(formData.authors) ? formData.authors.join(", ") : ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="pageCount" className="block text-sm text-zinc-400 mb-1">Page Count</label>
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
              <label htmlFor="publisher" className="block text-sm text-zinc-400 mb-1">Publisher</label>
              <input
                id="publisher"
                name="publisher"
                value={formData.publisher || ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="isbn" className="block text-sm text-zinc-400 mb-1">ISBN</label>
              <input
                id="isbn"
                name="isbn"
                value={formData.isbn || ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </>
      )}

      {currentMediaType === "game" && (
        <>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <h3 className="text-md font-semibold text-sky-400 mb-2">Game Details</h3>
            <div>
              <label htmlFor="platforms" className="block text-sm text-zinc-400 mb-1">Platforms (comma-separated)</label>
              <input
                id="platforms"
                name="platforms"
                value={Array.isArray(formData.platforms) ? formData.platforms.join(", ") : ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="e.g., PC, PS5, Nintendo Switch"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="developers" className="block text-sm text-zinc-400 mb-1">Developers (comma-separated)</label>
              <input
                id="developers"
                name="developers"
                value={Array.isArray(formData.developers) ? formData.developers.join(", ") : ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="gamePublisher" className="block text-sm text-zinc-400 mb-1">Publisher (Game)</label>
              <input
                id="gamePublisher"
                name="gamePublisher"
                value={formData.gamePublisher || ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="hoursPlayed" className="block text-sm text-zinc-400 mb-1">Hours Played</label>
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
        </>
      )}

      {(currentMediaType === "movie" || currentMediaType === "show" || currentMediaType === "anime") && (
        <>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <h3 className="text-md font-semibold text-sky-400 mb-2">
                {currentMediaType === "movie" && "Movie Details"}
                {currentMediaType === "show" && "Show Details"}
                {currentMediaType === "anime" && "Anime Details"}
            </h3>
            <div>
              <label htmlFor="director" className="block text-sm text-zinc-400 mb-1">Director</label>
              <input
                id="director"
                name="director"
                value={formData.director || ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="mt-3">
              <label htmlFor="runtimeMinutes" className="block text-sm text-zinc-400 mb-1">Runtime (Minutes)</label>
              <input
                id="runtimeMinutes"
                name="runtimeMinutes"
                type="number"
                value={formData.runtimeMinutes || ""}
                onChange={handleInputChange}
                className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            {(currentMediaType === "show" || currentMediaType === "anime") && (
                <>
                    <div className="mt-3">
                      <label htmlFor="seasonCount" className="block text-sm text-zinc-400 mb-1">Season Count</label>
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
                      <label htmlFor="episodeCount" className="block text-sm text-zinc-400 mb-1">Episode Count</label>
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
        </>
      )}

        {currentMediaType === "music_album" && (
            <>
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <h3 className="text-md font-semibold text-sky-400 mb-2">Music Album Details</h3>
                <div>
                  <label htmlFor="artist" className="block text-sm text-zinc-400 mb-1">Artist</label>
                  <input
                    id="artist"
                    name="artist"
                    value={formData.artist || ""}
                    onChange={handleInputChange}
                    className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="musicGenre" className="block text-sm text-zinc-400 mb-1">Genres (comma-separated)</label>
                  <input
                    id="musicGenre"
                    name="musicGenre"
                    value={Array.isArray(formData.musicGenre) ? formData.musicGenre.join(", ") : ""}
                    onChange={handleInputChange}
                    className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="trackCount" className="block text-sm text-zinc-400 mb-1">Track Count</label>
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
                  <label htmlFor="recordLabel" className="block text-sm text-zinc-400 mb-1">Record Label</label>
                  <input
                    id="recordLabel"
                    name="recordLabel"
                    value={formData.recordLabel || ""}
                    onChange={handleInputChange}
                    className="w-full bg-ashe text-zinc-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            </>
        )}

      {isEditMode && formData.dateLogged && (
         <div className="mt-4 pt-4 border-t border-zinc-700">
           <label className="block text-sm text-zinc-400 mb-1">Date Logged (Read-only)</label>
           <input
             type="text" // Changed to text to display formatted dateLogged
             value={new Date(formData.dateLogged).toLocaleDateString("en-CA", { // en-CA for YYYY-MM-DD
                year: 'numeric', month: '2-digit', day: '2-digit'
             })}
             readOnly
             className="w-full bg-zinc-700/50 text-zinc-400 rounded px-3 py-2 cursor-not-allowed"
           />
         </div>
      )}
    </>
  );
}
