// src/models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    icon: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi user không được trùng tên + type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;
