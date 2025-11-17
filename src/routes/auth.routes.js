// src/routes/auth.routes.js
import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * @route POST /api/v1/auth/register
 */
router.post("/register", register);

/**
 * @route POST /api/v1/auth/login
 */
router.post("/login", login);

/**
 * @route GET /api/v1/auth/me
 */
router.get("/me", requireAuth, getMe);

export default router;
