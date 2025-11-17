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
    // icon đơn giản là 1 string, FE muốn dùng emoji gì thì lưu string đó
    icon: {
      type: String,
      default: "💰",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
