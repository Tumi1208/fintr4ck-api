// src/routes/transaction.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/transactions?...
router.get("/", getTransactions);

// POST /api/v1/transactions
router.post("/", createTransaction);

// GET /api/v1/transactions/summary
router.get("/summary", getSummary);

// PUT /api/v1/transactions/:id
router.put("/:id", updateTransaction);

// DELETE /api/v1/transactions/:id
router.delete("/:id", deleteTransaction);

export default router;
