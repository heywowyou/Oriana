import { Request, Response } from "express";
import { admin } from "../lib/firebaseAdmin";
import User from "../models/users";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create user in Firebase
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    // Save user in MongoDB
    const newUser = new User({
      firebaseUid: firebaseUser.uid,
      email,
      username,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        firebaseUid: newUser.firebaseUid,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;

    // Find the user in MongoDB based on their firebaseUid
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
