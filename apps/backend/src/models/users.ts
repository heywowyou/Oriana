import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true }, // new field
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, trim: true }, // optional
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
