import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
