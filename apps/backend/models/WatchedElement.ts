import mongoose, { Schema } from "mongoose";

const watchedElementSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["movie", "show", "anime"], required: true },
    title: { type: String, required: true },
    cover: { type: String },
    dateWatched: { type: Date, default: Date.now },
    note: { type: String },
    rating: { type: Number, min: 0, max: 10 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WatchedElement ||
  mongoose.model("WatchedElement", watchedElementSchema);
