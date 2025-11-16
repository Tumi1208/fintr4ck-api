// Kết nối MongoDB Atlas

import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn("Chưa có MONGO_URI, không thể kết nối database.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Đã kết nối MongoDB.");
  } catch (err) {
    console.error("Lỗi kết nối MongoDB:", err.message);
    throw err;
  }
}