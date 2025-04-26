import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import watchedElementRoutes from "../src/routes/watchedElementRoutes";
import userRoutes from "../src/routes/userRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/watched", watchedElementRoutes);
app.use("/users", userRoutes);

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
