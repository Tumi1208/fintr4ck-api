// src/middleware/auth.js
// Kiểm tra JWT trong header Authorization

import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    // Header chuẩn dạng: "Bearer token..."
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    // Giải mã token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Lưu userId vào request để controller dùng
    req.userId = payload.userId;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
