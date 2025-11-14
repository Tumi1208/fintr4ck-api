// src/controllers/auth.controller.js
// Controller xử lý logic đăng ký, đăng nhập, lấy thông tin người dùng

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Hàm tạo JWT, dùng chung cho login và register (nếu muốn)
function generateToken(user) {
  // payload chỉ nên chứa thông tin cần thiết
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // token hết hạn sau 7 ngày
  );
}

// Đăng ký tài khoản mới
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào đơn giản
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu name, email hoặc password" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Có thể tạo token luôn, nhưng ở đây chỉ trả user basic
    const token = generateToken(user);

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    // Đẩy lỗi sang middleware errorHandler
    next(err);
  }
}

// Đăng nhập
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Kiểm tra input đơn giản
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      // Không nói rõ "email không tồn tại" để tránh lộ thông tin
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo token
    const token = generateToken(user);

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Lấy thông tin người dùng hiện tại (dựa vào token)
// Route này cần middleware authMiddleware chạy trước
export async function getMe(req, res, next) {
  try {
    // req.userId đã được gán trong authMiddleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy userId trong request" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.json({
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  } catch (err) {
    next(err);
  }
}
