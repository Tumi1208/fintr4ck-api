import express from "express";
// Import thêm resetPasswordMock
import { register, login, getMe, resetPasswordMock } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Đăng ký
// POST /api/v1/auth/register
router.post("/register", register);

// Đăng nhập
// POST /api/v1/auth/login
router.post("/login", login);

// Lấy thông tin User (Cần đăng nhập)
// GET /api/v1/auth/me
router.get("/me", requireAuth, getMe);

// --- [MỚI] Route Reset Password (Public) ---
// POST /api/v1/auth/reset-password
router.post("/reset-password", resetPasswordMock);

export default router;