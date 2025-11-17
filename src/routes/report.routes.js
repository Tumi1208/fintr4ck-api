// FILE: src/routes/report.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
// Móc nối sang transaction controller để lấy hàm vẽ biểu đồ
import { getExpenseBreakdown } from "../controllers/transaction.controller.js";

const router = express.Router();

router.use(requireAuth);

// Đường dẫn lấy dữ liệu biểu đồ
router.get("/expense-breakdown", getExpenseBreakdown);

export default router;