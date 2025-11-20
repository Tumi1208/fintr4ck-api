// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import userRoutes from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import { errorHandler } from "./middleware/error.js";

// --- IMPORT KHẨN CẤP ĐỂ FIX LỖI 404 ---
import { getMe } from "./controllers/auth.controller.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_ORIGIN,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());

// Trang chủ: Hiển thị thông báo server đang chạy
app.get("/", (req, res) => {
  res.send(`
      <h1 style="text-align: center; margin-top: 50px; font-family: sans-serif;">
          🚀 Fintr4ck API Server is running!
      </h1>
      <p style="text-align: center; font-family: sans-serif;">
          Access API Docs at: <a href="/docs">/docs</a>
      </p>
  `);
});

// --- [FIX] KHAI BÁO CỨNG ROUTE /ME TẠI ĐÂY ---
// Đoạn này sẽ chạy trước tất cả các file routes khác để đảm bảo không bị 404
app.get("/api/v1/auth/me", requireAuth, (req, res, next) => {
    console.log("🔥 Đã kích hoạt Route khẩn cấp: /api/v1/auth/me");
    getMe(req, res, next);
});

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes chính
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/challenges", challengeRoutes);

// Middleware xử lý lỗi chung
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

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
