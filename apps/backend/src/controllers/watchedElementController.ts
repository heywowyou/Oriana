import { Request, Response } from "express";
import WatchedElement from "../models/mediaItem";

// Fetch all watched elements for logged-in user
export const getWatchedForUser = async (req: Request, res: Response) => {
  const userId = (req as any).uid; // from the token
  const watched = await WatchedElement.find({ user: userId });
  res.status(200).json(watched);
};

// Create new watched element for logged-in user
export const createWatched = async (req: Request, res: Response) => {
  const userId = (req as any).uid; // from the token
  const { title, cover, type, rating, favorite, dateWatched } = req.body;

  const watchedElement = new WatchedElement({
    user: userId,
    title,
    cover,
    type,
    rating,
    favorite,
    dateWatched,
  });

  await watchedElement.save();

  res.status(201).json(watchedElement);
};

// Update an existing watched element
export const updateWatched = async (req: Request, res: Response) => {
  const userId = (req as any).uid; // from the token
  const { id } = req.params;
  const { title, cover, type, rating, favorite, dateWatched } = req.body;

  const watchedElement = await WatchedElement.findById(id);

  if (!watchedElement) {
    return res.status(404).json({ message: "Watched element not found" });
  }

  if (watchedElement.user.toString() !== userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Update fields
  watchedElement.title = title;
  watchedElement.cover = cover;
  watchedElement.type = type;
  watchedElement.rating = rating;
  watchedElement.favorite = favorite;
  watchedElement.dateWatched = dateWatched;

  await watchedElement.save();

  res.status(200).json(watchedElement);
};

// Toggle element favorite status
export const toggleFavorite = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { favorite } = req.body;

  if (typeof favorite !== "boolean") {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'favorite' value." });
  }

  try {
    const updated = await WatchedElement.findByIdAndUpdate(
      id,
      { favorite },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Watched element not found." });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update favorite status." });
  }
};
