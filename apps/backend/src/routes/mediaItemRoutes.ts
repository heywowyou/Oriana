import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  createMediaItem,
  getMediaItemsForUser,
  updateMediaItem,
  toggleFavorite,
  deleteMediaItem, // New import
} from "../controllers/mediaItemController"; // Updated import
import catchAsync from "../utils/catchAsync";

const router = express.Router();

// GET /me - Fetch media items for logged-in user (e.g., /api/media/me)
// Query parameters can be used for filtering (e.g., ?mediaType=book&favorite=true)
router.get("/me", catchAsync(verifyToken), catchAsync(getMediaItemsForUser));

// POST / - Create new media item for logged-in user (e.g., /api/media)
router.post("/", catchAsync(verifyToken), catchAsync(createMediaItem));

// PUT /:id - Update existing media item data (e.g., /api/media/:id)
router.put("/:id", catchAsync(verifyToken), catchAsync(updateMediaItem));

// PUT /:id/favorite - Toggle media item favorite status (e.g., /api/media/:id/favorite)
router.put(
  "/:id/favorite",
  catchAsync(verifyToken), // Added verifyToken for consistency and security
  catchAsync(toggleFavorite)
);

// DELETE /:id - Delete a media item (e.g., /api/media/:id)
router.delete("/:id", catchAsync(verifyToken), catchAsync(deleteMediaItem));

export default router;
