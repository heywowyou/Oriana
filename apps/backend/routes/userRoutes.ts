import express from "express";
import { signupUser } from "../controllers/userController";

const router = express.Router();

router.post("/signup", signupUser);

export default router;
