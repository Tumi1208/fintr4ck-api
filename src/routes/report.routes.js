// src/routes/report.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getExpenseBreakdown } from "../controllers/transaction.controller.js";

const router = Router();

router.use(requireAuth);

// Breakdown chi tiêu theo category cho Dashboard
router.get("/expense-breakdown", getExpenseBreakdown);

export default router;
