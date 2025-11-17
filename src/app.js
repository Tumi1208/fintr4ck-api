// src/app.js
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
import categoryRoutes from "./routes/category.routes.js";
import userRoutes from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();

// CORS để FE gọi được API
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_ORIGIN, // sau này deploy FE
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());

// Health check
app.use("/api/v1/health", healthRoutes);

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes chính
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reports", reportRoutes);

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
