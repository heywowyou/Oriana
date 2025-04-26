import express from "express";
import {
  addWatchedElement,
  getWatchedElements,
} from "../controllers/watchedElementController";

const router = express.Router();

// POST /api/watched → Add a new watched element
router.post("/", addWatchedElement);

// GET /api/watched/:userId → Get all watched elements for a user
router.get("/:userId", getWatchedElements);

export default router;
