import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import watchedElementRoutes from "../routes/watchedElementRoutes";
import userRoutes from "../routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/watched", watchedElementRoutes);
app.use("/api/users", userRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
