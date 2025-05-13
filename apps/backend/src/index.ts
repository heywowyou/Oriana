import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import watchedElementRoutes from "./routes/mediaItemRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/watched", watchedElementRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
