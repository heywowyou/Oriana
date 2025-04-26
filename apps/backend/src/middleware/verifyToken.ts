import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../lib/firebaseAdmin";
import { catchAsync } from "../utils/catchAsync"; // Correct import

export const verifyToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    (req as any).user = decodedToken;
    next();
  }
);
