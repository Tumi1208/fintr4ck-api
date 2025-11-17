// src/controllers/user.controller.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

// Cập nhật tên hiển thị
export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tên không được để trống" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Đổi mật khẩu
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    next(err);
  }
}

// Xoá tài khoản + dữ liệu liên quan
export async function deleteMe(req, res, next) {
  try {
    const userId = req.userId;

    await Transaction.deleteMany({ user: userId });
    await Category.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Tài khoản và dữ liệu liên quan đã được xoá" });
  } catch (err) {
    next(err);
  }
}
