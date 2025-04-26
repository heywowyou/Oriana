import express from "express";
import catchAsync from "../utils/catchAsync";
import {
  createUser,
  getMe,
  findEmailByUsername,
} from "../controllers/userController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Register route
router.post("/register", catchAsync(createUser));

// Me route (protected)
router.get("/me", catchAsync(verifyToken), catchAsync(getMe));

// Login with username
router.post("/login-by-username", catchAsync(findEmailByUsername));

export default router;
