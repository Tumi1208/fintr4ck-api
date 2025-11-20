// src/models/UserChallenge.js
import mongoose from "mongoose";

const userChallengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },
    joinedAt: { type: Date, default: Date.now },
    startDate: { type: Date, required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completedDays: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "COMPLETED", "FAILED"], default: "ACTIVE", index: true },
    lastCheckInDate: { type: Date },
  },
  { timestamps: true }
);

userChallengeSchema.index(
  { user: 1, challenge: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

export default mongoose.model("UserChallenge", userChallengeSchema);
