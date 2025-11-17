import mongoose from "mongoose";
import dotenv from "dotenv";

// 1. Load cấu hình từ file .env
dotenv.config();

// 2. Lấy đường dẫn DB (Nếu trong .env không có thì dùng mặc định)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fintr4ck";

console.log("🔥 ĐANG KẾT NỐI TỚI:", MONGO_URI);

const resetData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối!");

    // 3. Xóa sạch sẽ toàn bộ Database
    await mongoose.connection.db.dropDatabase();
    console.log("🗑️  ĐÃ XÓA SẠCH DATABASE THÀNH CÔNG!");

    // 4. Ngắt kết nối
    await mongoose.disconnect();
    console.log("✨ Xong. Bây giờ Web của bạn như mới tinh.");
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
};

resetData();