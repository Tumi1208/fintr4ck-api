// src/models/Challenge.js
import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ["NO_SPEND", "SAVE_FIXED", "CUSTOM"], required: true, index: true },
    durationDays: { type: Number, required: true },
    targetAmountPerDay: { type: Number },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Challenge", challengeSchema);
