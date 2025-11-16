// src/controllers/auth.controller.js
// Các logic đăng ký, đăng nhập, lấy thông tin user

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

// Đăng ký tài khoản mới
export async function register(req, res, next) {
  const { name, email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || "New user",
      email,
      passwordHash: hash
    });

    const token = createToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

// Đăng nhập
export async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }

    // Hỗ trợ cả user cũ (lưu trong field password) và user mới (passwordHash)
    const hash = user.passwordHash || user.password;
    if (!hash) {
      // Không có hash để so sánh => coi như sai mật khẩu
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }

    const match = await bcrypt.compare(password, hash);
    if (!match) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }

    const token = createToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

// Lấy thông tin user hiện tại
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user." });
    }
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}
