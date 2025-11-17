// src/models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    // Sau này có thể dùng để lưu icon name (heroicons, font-awesome, ...).
    icon: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
