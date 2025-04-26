import express from "express";
import catchAsync from "../utils/catchAsync";
import { createUser } from "../controllers/userController";

const router = express.Router();

// Register route
router.post("/register", catchAsync(createUser));

export default router;
