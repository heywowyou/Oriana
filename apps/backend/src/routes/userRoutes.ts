import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import { createIfNotExists } from "../controllers/userController";

const router = express.Router();

// Protected route: create user if not exists after Firebase login/signup
router.post("/createIfNotExists", verifyToken, createIfNotExists);

export default router;
