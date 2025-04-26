import express from "express";
import catchAsync from "../utils/catchAsync";
import { createUser, getMe } from "../controllers/userController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Register route
router.post("/register", catchAsync(createUser));

// Me route (protected)
router.get("/me", catchAsync(verifyToken), catchAsync(getMe));

export default router;
