import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  createWatched,
  getWatchedForUser,
  updateWatched,
} from "../controllers/watchedElementController";
import catchAsync from "../utils/catchAsync";

const router = express.Router();

// GET /watched/me - Fetch watched elements for logged-in user
router.get("/me", catchAsync(verifyToken), getWatchedForUser);

// POST /watched - Create new watched element for logged-in user
router.post("/", catchAsync(verifyToken), createWatched);

// PUT /watched/:id - Update existing element data
router.put("/watched/:id", catchAsync(verifyToken), catchAsync(updateWatched));

export default router;
