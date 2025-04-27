import { Request, Response } from "express";
import WatchedElement from "../models/watchedElements";

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
