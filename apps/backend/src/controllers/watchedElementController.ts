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
  const { title, cover, type, rating, dateWatched } = req.body;

  const watchedElement = new WatchedElement({
    user: userId,
    title,
    cover,
    type,
    rating,
    dateWatched,
  });

  await watchedElement.save();

  res.status(201).json(watchedElement);
};
