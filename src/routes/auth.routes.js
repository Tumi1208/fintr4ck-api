// src/routes/auth.routes.js
// Định nghĩa các route liên quan tới auth (đăng ký, đăng nhập, lấy info)

import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", register);

// POST /api/v1/auth/login
router.post("/login", login);

// GET /api/v1/auth/me
// Route này cần token, sẽ đi qua authMiddleware trước
router.get("/me", authMiddleware, getMe);

export default router;
