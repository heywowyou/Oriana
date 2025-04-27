import mongoose, { Schema } from "mongoose";

const watchedElementSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    cover: { type: String },
    type: { type: String, enum: ["movie", "show", "anime"], required: true },
    rating: { type: Number, min: 0, max: 5 },
    favorite: { type: Boolean, default: false },
    dateWatched: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WatchedElement ||
  mongoose.model("WatchedElement", watchedElementSchema);
