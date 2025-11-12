// Ý tưởng: Ngày 1 mình chưa cần DB nên không muốn cài mongoose.
// File này sẽ chỉ import('mongoose') khi .env có MONGO_URI.
// Nhờ vậy, nếu MONGO_URI trống thì không cần package mongoose vẫn chạy được.

export async function connect() {
  const uri = process.env.MONGO_URI;

  // Chưa cấu hình DB => bỏ qua cho nhẹ, in cảnh báo để nhớ
  if (!uri) {
    console.warn("Chưa có MONGO_URI, tạm thời bỏ qua kết nối DB (Day 1).");
    return;
  }

  try {
    // Import động: chỉ khi cần mới tải mongoose
    const mongoose = (await import("mongoose")).default;
    await mongoose.connect(uri);
    console.log("Kết nối MongoDB thành công!");
  } catch (err) {
    console.error("Lỗi khi kết nối MongoDB:", err.message);
    process.exit(1);
  }
}
