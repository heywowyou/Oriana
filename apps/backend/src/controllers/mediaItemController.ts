import { Request, Response } from "express";
import MediaItem, { IMediaItem, MEDIA_TYPES } from "../models/mediaItem"; // Updated import to include MEDIA_TYPES

// --- Helper function to extract allowed fields (good for security and preventing unwanted updates) ---
const getAllowedFields = (body: any): Partial<IMediaItem> => {
  const allowedFields: (keyof IMediaItem)[] = [
    "title",
    "cover",
    "mediaType",
    "rating",
    "favorite",
    "notes",
    "dateConsumed",
    "status",
    "tags",
    "externalIds",
    "releaseDate",
    "authors",
    "pageCount",
    "publisher",
    "isbn", // Book
    "platforms",
    "developers",
    "gamePublisher",
    "hoursPlayed", // Game
    "director",
    "runtimeMinutes",
    "seasonCount",
    "episodeCount", // Movie/Show/Anime
    "artist",
    "musicGenre",
    "trackCount",
    "recordLabel", // Music Album
    // 'user' and '_id' are handled separately or by mongoose
  ];

  const data: Partial<IMediaItem> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      // Basic sanitization or validation could be added here if needed
      // For array fields, ensure they are actually arrays if provided
      const arrayFields = [
        "tags",
        "authors",
        "platforms",
        "developers",
        "musicGenre",
      ];
      if (
        arrayFields.includes(key as string) &&
        body[key] !== null &&
        !Array.isArray(body[key])
      ) {
        // Handle non-array inputs for array fields if necessary, e.g., convert comma-separated string
        // For now, we'll assume client sends arrays or null for these.
        // If you expect comma-separated strings, you could split them:
        // data[key as keyof IMediaItem] = typeof body[key] === 'string' ? body[key].split(',').map((s:string) => s.trim()) : body[key];
        data[key as keyof IMediaItem] = body[key]; // Or decide to reject if not an array
      } else {
        data[key as keyof IMediaItem] = body[key];
      }
    }
  }

  // Ensure mediaType is always present and valid if provided
  if (body.mediaType) {
    // Check if mediaType is provided in the body
    if (MEDIA_TYPES.includes(body.mediaType)) {
      // Validate against our imported MEDIA_TYPES
      data.mediaType = body.mediaType;
    } else {
      // If an invalid mediaType is provided, we should not set it.
      // Depending on desired behavior, you could:
      // 1. Omit it (as done by not assigning to data.mediaType if invalid)
      // 2. Throw an error or return a response indicating an invalid mediaType
      // For create operations, mediaType is required, so this check is crucial.
      // For update operations, if mediaType is not allowed to change, it's deleted later anyway.
      // For now, if an invalid one is sent, it won't be part of 'data',
      // so a subsequent check in 'createMediaItem' for 'data.mediaType' would fail if it was invalid.
      console.warn(
        `Invalid mediaType received: ${body.mediaType}. It will be ignored.`
      );
    }
  }

  return data;
};

// Fetch all media items for logged-in user (can be filtered by query params)
export const getMediaItemsForUser = async (req: Request, res: Response) => {
  const userId = (req as any).uid;
  const query: any = { user: userId };

  // Example: Allow filtering by mediaType, status, favorite via query parameters
  if (
    req.query.mediaType &&
    typeof req.query.mediaType === "string" &&
    MEDIA_TYPES.includes(req.query.mediaType as any)
  ) {
    query.mediaType = req.query.mediaType;
  }
  if (req.query.status && typeof req.query.status === "string") {
    // Add more robust validation if needed
    query.status = req.query.status;
  }
  if (req.query.favorite) {
    query.favorite = req.query.favorite === "true";
  }

  const sortBy = (req.query.sortBy as string) || "-dateConsumed -createdAt";
  const sortOptions: any = {};
  sortBy.split(" ").forEach((part) => {
    if (part.trim() === "") return;
    const order = part.startsWith("-") ? -1 : 1;
    const field = part.replace(/^-/, ""); // Remove leading hyphen
    sortOptions[field] = order;
  });

  try {
    // Added try-catch for database operations
    const items = await MediaItem.find(query).sort(sortOptions).lean(); // .lean() can improve performance for read-only
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching media items:", error);
    res
      .status(500)
      .json({ message: "Error fetching media items from database." });
  }
};

// Create new media item for logged-in user
export const createMediaItem = async (req: Request, res: Response) => {
  const userId = (req as any).uid;
  const itemData = getAllowedFields(req.body);

  if (!itemData.title || !itemData.mediaType) {
    return res
      .status(400)
      .json({ message: "Missing required fields: title and mediaType" });
  }
  // Further validation: ensure the mediaType from itemData (if it passed getAllowedFields) is valid.
  // This is belt-and-suspenders since getAllowedFields now validates it.
  if (!MEDIA_TYPES.includes(itemData.mediaType as any)) {
    return res
      .status(400)
      .json({ message: `Invalid mediaType: ${itemData.mediaType}` });
  }

  try {
    // Added try-catch
    const mediaItemDoc = new MediaItem({
      ...itemData,
      user: userId,
    });
    await mediaItemDoc.save();
    res.status(201).json(mediaItemDoc);
  } catch (error: any) {
    console.error("Error creating media item:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating media item." });
  }
};

// Update an existing media item
export const updateMediaItem = async (req: Request, res: Response) => {
  const userId = (req as any).uid;
  const { id } = req.params;
  const itemData = getAllowedFields(req.body);

  // Prevent changing mediaType via this update method.
  // If the body included a mediaType, getAllowedFields would have validated it.
  // But we generally don't want it changed.
  if (itemData.mediaType !== undefined) {
    // console.log("Attempt to change mediaType during update was ignored."); // Optional logging
    delete itemData.mediaType;
  }

  try {
    // Added try-catch
    const mediaItem = await MediaItem.findById(id);

    if (!mediaItem) {
      return res.status(404).json({ message: "Media item not found" });
    }

    if (mediaItem.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to update this item" });
    }

    Object.assign(mediaItem, itemData);
    // Ensure array fields are correctly overwritten or merged if partial updates are intended
    // For example, if tags are sent, Object.assign will replace the existing tags array.
    // If you want to add/remove individual tags, you'd need more specific logic here.

    await mediaItem.save();
    res.status(200).json(mediaItem);
  } catch (error: any) {
    console.error("Error updating media item:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating media item." });
  }
};

// Toggle media item favorite status
export const toggleFavorite = async (req: Request, res: Response) => {
  const userId = (req as any).uid;
  const { id } = req.params;
  const { favorite } = req.body;

  if (typeof favorite !== "boolean") {
    return res.status(400).json({
      error: "Missing or invalid 'favorite' value (must be boolean).",
    });
  }

  try {
    // Added try-catch
    const mediaItem = await MediaItem.findById(id);

    if (!mediaItem) {
      return res.status(404).json({ error: "Media item not found." });
    }

    if (mediaItem.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "User not authorized to update this item." });
    }

    mediaItem.favorite = favorite;
    await mediaItem.save();
    return res.status(200).json(mediaItem);
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Error toggling favorite status." });
  }
};

// Delete a media item
export const deleteMediaItem = async (req: Request, res: Response) => {
  const userId = (req as any).uid;
  const { id } = req.params;

  try {
    // Added try-catch
    const mediaItem = await MediaItem.findById(id);

    if (!mediaItem) {
      return res.status(404).json({ message: "Media item not found" });
    }

    if (mediaItem.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this item" });
    }

    await MediaItem.findByIdAndDelete(id);
    res.status(200).json({ message: "Media item deleted successfully" });
  } catch (error) {
    console.error("Error deleting media item:", error);
    res.status(500).json({ message: "Error deleting media item." });
  }
};
