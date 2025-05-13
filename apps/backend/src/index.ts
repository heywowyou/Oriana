import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import mediaItemRoutes from "./routes/mediaItemRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount API routes
app.use("/api/users", userRoutes);
app.use("/api/media", mediaItemRoutes);

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 4000;

if (!mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1); // Exit if DB connection string is missing
}

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit if DB connection fails
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
