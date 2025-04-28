import express from "express";
import catchAsync from "../utils/catchAsync";
import { syncUser } from "../controllers/userController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Register route
router.post("/sync", catchAsync(verifyToken), catchAsync(syncUser));

export default router;
