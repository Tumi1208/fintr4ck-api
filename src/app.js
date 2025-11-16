// File chính khởi tạo server Express

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();

// Cấu hình CORS để FE gọi được API
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_ORIGIN // sau này là domain FE khi deploy
    ].filter(Boolean),
    credentials: true
  })
);

// Middleware chung
app.use(morgan("dev"));
app.use(express.json());

// Route health đơn giản để kiểm tra server
app.use("/api/v1/health", healthRoutes);

// Swagger UI để xem tài liệu API
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes chính
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);

// Middleware xử lý lỗi chung
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Kết nối DB rồi mới start server
connectDB()
  .then(() => {
    console.log("Kết nối MongoDB thành công!");
    app.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Lỗi khi kết nối MongoDB:", err.message);
  });

export default app;