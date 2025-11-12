// Middleware để xử lý lỗi tập trung
// Nếu có lỗi xảy ra trong API, code sẽ nhảy vào đây

export function errorHandler(err, req, res, next) {
    console.error("💥 Lỗi server:", err);
    res.status(err.status || 500).json({
      message: err.message || "Đã có lỗi xảy ra trên server!"
    });
  }
  