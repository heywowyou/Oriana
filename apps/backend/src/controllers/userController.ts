import { Request, Response } from "express";
import User from "../models/users"; // adjust if needed
import { catchAsync } from "../utils/catchAsync";

export const createIfNotExists = catchAsync(
  async (req: Request, res: Response) => {
    const { uid, email, name, picture } = req.body;

    console.log("🛠️ Received request to create or find user:", { uid, email });

    // Try to find existing user
    let user = await User.findOne({ uid });

    if (user) {
      console.log("✅ User already exists:", user.uid);
      return res.status(200).json({ message: "User already exists", user });
    }

    // Create new user
    user = await User.create({
      uid,
      email,
      name,
      picture,
    });

    console.log("🎉 Created new user:", user.uid);

    res.status(201).json({ message: "User created", user });
  }
);
