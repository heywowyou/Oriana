import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes"; // <--- add this!

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/ping", (req, res) => {
  console.log("Received a ping request");
  res.send("pong");
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
