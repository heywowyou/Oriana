import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
