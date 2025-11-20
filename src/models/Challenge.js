// src/models/Challenge.js
import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["NO_SPEND", "SAVE_FIXED", "CUSTOM"],
      required: true,
      index: true,
    },
    durationDays: { type: Number, required: true },
    targetAmountPerDay: { type: Number },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isPublic: { type: Boolean, default: true, index: true },
    startDate: { type: Date },
  },
  { timestamps: true }
);

// Chỉ yêu cầu targetAmountPerDay khi type = SAVE_FIXED
challengeSchema.pre("validate", function (next) {
  if (this.type === "SAVE_FIXED" && (this.targetAmountPerDay == null || Number.isNaN(this.targetAmountPerDay))) {
    this.invalidate("targetAmountPerDay", "targetAmountPerDay bắt buộc với loại SAVE_FIXED");
  }
  next();
});

challengeSchema.index({ isPublic: 1, type: 1 });

export default mongoose.model("Challenge", challengeSchema);
