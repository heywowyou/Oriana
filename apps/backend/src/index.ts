import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import watchedElementRoutes from "./routes/watchedElementRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/watched", watchedElementRoutes);

app.get("/ping", (req, res) => {
  console.log("Received a ping request");
  res.send("pong");
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
