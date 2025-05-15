export const MEDIA_TYPES_FRONTEND = [
  "movie",
  "show",
  "anime",
  "book",
  "game",
  "music_album",
] as const; // `as const` makes it a readonly tuple of string literals

// MediaType will be a union of the string literals: "movie" | "show" | ...
export type MediaType = (typeof MEDIA_TYPES_FRONTEND)[number];

// Interface for a Media Item, matching the structure from the backend (IMediaItem)
// Dates from the API will likely be ISO strings, but can be Date objects in client-side state.
export interface IMediaItem {
  _id: string; // MongoDB ObjectId string
  user: string; // Firebase UID of the user who owns this item
  title: string; // General title (e.g., movie title, book title, album title, game title)
  cover?: string; // URL to cover image
  mediaType: MediaType; // The type of media, using our defined MediaType
  rating?: number; // User's personal rating (e.g., 0-5)
  favorite?: boolean;
  notes?: string; // Personal review/notes
  dateConsumed?: string | Date; // Date watched, read, played, listened to, finished, etc.
  dateLogged: string | Date; // When the item was first created in Oriana (from backend's createdAt via virtual)
  status?: "completed" | "in_progress" | "planned" | "on_hold" | "dropped"; // Tracking progress
  tags?: string[]; // User-defined tags or genres
  externalIds?: Record<string, string>; // e.g., { tmdb: "123", goodreads: "456", musicbrainz_album: "789" }
  releaseDate?: string | Date; // Original release date of the media

  // --- Book-specific fields ---
  authors?: string[];
  pageCount?: number;
  publisher?: string; // For books
  isbn?: string;

  // --- Game-specific fields ---
  platforms?: string[];
  developers?: string[];
  gamePublisher?: string; // For games (can be different from book publisher)
  hoursPlayed?: number;

  // --- Movie/Show/Anime specific fields ---
  director?: string;
  runtimeMinutes?: number;
  seasonCount?: number;
  episodeCount?: number;

  // --- Music Album-specific fields ---
  artist?: string;
  musicGenre?: string[]; // Can be different from 'tags' if 'tags' are user-defined and 'musicGenre' is more formal
  trackCount?: number;
  recordLabel?: string;

  // Timestamps from Mongoose, will be strings if JSON.parse'd from API.
  // Can be converted to Date objects in client-side logic if needed.
  createdAt: string | Date;
  updatedAt: string | Date;
}
