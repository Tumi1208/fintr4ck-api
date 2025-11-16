// Mô hình Transaction để lưu chi tiêu / thu nhập

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    category: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    note: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);