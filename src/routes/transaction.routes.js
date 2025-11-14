// src/routes/transaction.routes.js
// Định nghĩa các endpoint cho giao dịch (thu/chi)

import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createTransaction,
  getTransactions,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

// Tất cả route ở đây đều yêu cầu đăng nhập
router.use(authMiddleware);

// Lấy danh sách giao dịch của user hiện tại
router.get("/", getTransactions);

// Thêm giao dịch mới
router.post("/", createTransaction);

// Xóa một giao dịch theo id
router.delete("/:id", deleteTransaction);

export default router;
