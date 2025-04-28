import { Request, Response } from "express";
import User from "../models/users";

export const syncUser = async (req: Request, res: Response) => {
  const { firebaseUID, email, displayName, photoURL } = req.body;

  if (!firebaseUID || !email) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { email, displayName, photoURL },
      { upsert: true, new: true }
    );
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
