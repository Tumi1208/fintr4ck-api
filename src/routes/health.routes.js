// Route này để test xem server có đang chạy hay không
// Dạng như "ping" API, nếu trả về ok thì backend hoạt động tốt

import { Router } from "express";
const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái server
 *     responses:
 *       200:
 *         description: Server đang chạy tốt
 */
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Server Fintr4ck API đang hoạt động "
  });
});

export default router;
