// src/routes/auth.routes.js
import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Created }
 */
r.post("/auth/register", register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Đăng nhập và nhận JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 */
r.post("/auth/login", login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại (cần Bearer token)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
r.get("/auth/me", requireAuth, me);

export default r;
