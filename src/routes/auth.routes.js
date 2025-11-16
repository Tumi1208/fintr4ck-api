// Các route liên quan tới đăng ký / đăng nhập

import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Lấy thông tin user hiện tại
router.get("/me", requireAuth, getMe);

export default router;