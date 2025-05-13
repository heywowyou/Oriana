import mongoose, { Schema, Document } from "mongoose";

// Define the possible media types more broadly
export const MEDIA_TYPES = [
  "movie",
  "show",
  "anime",
  "book",
  "game",
  "music_album",
  // You can add more later, e.g., "podcast_episode"
] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export interface IMediaItem extends Document {
  user: string; // Firebase UID
  title: string; // General title (e.g., movie title, book title, album title, game title)
  cover?: string;
  mediaType: MediaType;
  rating?: number;
  favorite?: boolean;
  notes?: string;
  dateConsumed?: Date;
  dateLogged: Date; // Virtual from createdAt
  status?: "completed" | "in_progress" | "planned" | "on_hold" | "dropped";
  tags?: string[];
  externalIds?: Record<string, string>;
  releaseDate?: Date;

  // Book-specific fields
  authors?: string[];
  pageCount?: number;
  publisher?: string;
  isbn?: string;

  // Game-specific fields
  platforms?: string[];
  developers?: string[];
  gamePublisher?: string;
  hoursPlayed?: number;

  // Movie/Show/Anime specific fields
  director?: string;
  runtimeMinutes?: number;
  seasonCount?: number;
  episodeCount?: number;

  // Music Album-specific fields
  artist?: string;
  musicGenre?: string[];
  trackCount?: number;
  recordLabel?: string;

  createdAt: Date;
  updatedAt: Date;
}

const mediaItemSchema = new Schema<IMediaItem>(
  {
    // COMMON FIELDS
    user: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true }, // This will be Album Title for music_album
    cover: { type: String, trim: true },
    mediaType: { type: String, enum: MEDIA_TYPES, required: true },
    rating: { type: Number, min: 0, max: 5 },
    favorite: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    dateConsumed: { type: Date },
    status: {
      type: String,
      enum: ["completed", "in_progress", "planned", "on_hold", "dropped"],
    },
    tags: [{ type: String, trim: true }],
    externalIds: { type: Map, of: String },
    releaseDate: { type: Date },

    // MEDIA-TYPE SPECIFIC FIELDS (all optional)
    // Book
    authors: [{ type: String, trim: true }],
    pageCount: { type: Number, min: 0 },
    publisher: { type: String, trim: true },
    isbn: { type: String, trim: true },

    // Game
    platforms: [{ type: String, trim: true }],
    developers: [{ type: String, trim: true }],
    gamePublisher: { type: String, trim: true },
    hoursPlayed: { type: Number, min: 0 },

    // Movie/Show/Anime
    director: { type: String, trim: true },
    runtimeMinutes: { type: Number, min: 0 },
    seasonCount: { type: Number, min: 0 },
    episodeCount: { type: Number, min: 0 },

    // Music Album
    artist: { type: String, trim: true },
    musicGenre: [{ type: String, trim: true }],
    trackCount: { type: Number, min: 0 },
    recordLabel: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// INDEXES
mediaItemSchema.index({ user: 1, mediaType: 1 });
mediaItemSchema.index({ user: 1, favorite: 1 });
mediaItemSchema.index({ user: 1, dateConsumed: -1 });
mediaItemSchema.index({ title: "text" });
mediaItemSchema.index({ artist: "text" }); // Potentially useful for music

// VIRTUALS
mediaItemSchema.virtual("dateLogged").get(function (this: IMediaItem) {
  return this.createdAt;
});

mediaItemSchema.set("toObject", { virtuals: true });
mediaItemSchema.set("toJSON", { virtuals: true });

// MODEL EXPORT
export default mongoose.models.MediaItem ||
  mongoose.model<IMediaItem>("MediaItem", mediaItemSchema);
