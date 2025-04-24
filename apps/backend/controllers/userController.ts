import { Request, Response } from "express";
import User from "../models/User";

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Basic check for required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};
