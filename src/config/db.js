// src/config/db.js
// File cấu hình kết nối MongoDB bằng Mongoose

import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  // Nếu chưa cấu hình MONGO_URI thì in cảnh báo và không kết nối
  if (!uri) {
    console.warn("Chưa có MONGO_URI, tạm thời bỏ qua kết nối DB.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      // Các option cơ bản, Mongoose 7+ có thể không cần cũng được
    });

    console.log("Kết nối MongoDB thành công!");
  } catch (err) {
    console.error("Lỗi khi kết nối MongoDB:", err.message);
    // Ném lỗi ra ngoài để app.js biết và không start server
    throw err;
  }
}

// Nếu sau này cần dùng trực tiếp mongoose ở nơi khác thì import mongoose từ file này cũng được
export default mongoose;
