// apps/backend/src/controllers/userController.ts

import { Request, Response } from "express";
import User from "../models/users";
import { catchAsync } from "../utils/catchAsync"; // 👈 important

export const createIfNotExists = catchAsync(
  async (req: Request, res: Response) => {
    const firebaseUid = (req as any).user.uid;
    const email = (req as any).user.email;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing user information" });
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = new User({
        firebaseUid,
        email,
      });

      await user.save();
    }

    res
      .status(200)
      .json({ message: "User exists or created successfully", user });
  }
);
