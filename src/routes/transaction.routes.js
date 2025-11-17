// src/routes/transaction.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createTransaction,
  getTransactions,
  getSummary,
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(requireAuth);

// Danh sách + filter
router.get("/", getTransactions);

// Tạo giao dịch mới
router.post("/", createTransaction);

// Summary cho Dashboard
router.get("/summary", getSummary);

export default router;
