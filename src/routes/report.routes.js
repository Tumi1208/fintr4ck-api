import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getExpenseBreakdown } from "../controllers/transaction.controller.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/reports/expense-breakdown
router.get("/expense-breakdown", getExpenseBreakdown);

export default router;