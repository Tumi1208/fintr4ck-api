// src/routes/report.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getExpenseStatsByCategory } from "../controllers/transaction.controller.js";

const router = express.Router();

// Tất cả route báo cáo đều yêu cầu đăng nhập
router.use(requireAuth);

/**
 * GET /api/v1/reports/expense-breakdown
 * Trả về thống kê chi tiêu theo category (dùng cho biểu đồ Doughnut trên Dashboard)
 */
router.get("/expense-breakdown", getExpenseStatsByCategory);

export default router;
