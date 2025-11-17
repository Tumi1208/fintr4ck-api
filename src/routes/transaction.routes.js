// src/routes/transaction.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getExpenseStatsByCategory,
} from "../controllers/transaction.controller.js";

const router = express.Router();

// yêu cầu đăng nhập cho toàn bộ transaction API
router.use(requireAuth);

// Summary & chart data
router.get("/summary", getSummary);
router.get("/stats-by-category", getExpenseStatsByCategory);

// CRUD chính
router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
