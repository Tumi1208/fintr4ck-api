// src/models/User.js
// Mô hình User tối giản cho đăng ký / đăng nhập

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Lưu mật khẩu đã được hash (không lưu plain text)
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // tự động tạo createdAt, updatedAt
  }
);

export default mongoose.model("User", userSchema);
