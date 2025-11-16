// src/routes/transaction.routes.js
// Các route cho giao dịch tài chính

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Tất cả route bên dưới đều yêu cầu đăng nhập
router.use(requireAuth);

// Lấy danh sách giao dịch
router.get("/", getTransactions);

// Lấy thống kê thu/chi/số dư
router.get("/summary", getSummary);

// Tạo giao dịch mới
router.post("/", createTransaction);

// Cập nhật giao dịch
router.put("/:id", updateTransaction);

// Xóa giao dịch
router.delete("/:id", deleteTransaction);

export default router;
