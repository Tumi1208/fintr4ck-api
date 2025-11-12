// Đây là file chính của backend (entry point)
// Nó sẽ khởi chạy Express server, nạp middleware và route cơ bản

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connect } from "./config/db.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middleware/error.js";
import healthRoutes from "./routes/health.routes.js";

// Đọc file .env để lấy biến môi trường
dotenv.config();

// Kết nối database (tạm bỏ qua nếu chưa có MONGO_URI)
await connect();

const app = express();

// Cấu hình CORS để FE (React) có thể gọi API
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));

// Cho phép đọc dữ liệu JSON gửi từ client
app.use(express.json());

// Ghi log các request để dễ debug (VD: [GET] /api/v1/health 200)
app.use(morgan("dev"));

// Route test đơn giản để kiểm tra server
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Welcome to Fintr4ck API!" });
});

// Gắn route health vào prefix /api/v1
app.use("/api/v1", healthRoutes);

// Cung cấp tài liệu Swagger tại /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware xử lý lỗi (luôn để dưới cùng)
app.use(errorHandler);

// Lấy port từ .env hoặc mặc định 4000
const port = process.env.PORT || 4000;

// Khởi động server
app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
