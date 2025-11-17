// src/middleware/error.js
// Middleware để xử lý lỗi tập trung

export function errorHandler(err, req, res, next) {
  console.error("Lỗi server:", err);

  const status = err.status || 500;
  const message = err.message || "Đã có lỗi xảy ra trên server";

  res.status(status).json({ message });
}
