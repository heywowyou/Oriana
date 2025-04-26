import { Request, Response } from "express";
import WatchedElement from "../models/watchedElements";

// Add a new watched element to the database
export const addWatchedElement = async (req: Request, res: Response) => {
  try {
    const newElement = new WatchedElement(req.body);
    const saved = await newElement.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save watched element" });
  }
};

// Get all watched elements for a specific user
export const getWatchedElements = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const elements = await WatchedElement.find({ user: userId }).sort({
      dateWatched: -1,
    });
    res.status(200).json(elements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watched elements" });
  }
};
