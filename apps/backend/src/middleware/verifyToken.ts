import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).uid = decodedToken.uid;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
