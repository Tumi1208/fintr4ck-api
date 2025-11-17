// src/controllers/user.controller.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

export async function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên không được để trống" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select("-passwordHash");

    res.json({ user });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu mật khẩu" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải ít nhất 6 ký tự" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

export async function deleteMe(req, res) {
  try {
    const userId = req.userId;

    // Xoá data liên quan
    await Promise.all([
      Transaction.deleteMany({ user: userId }),
      Category.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: "Đã xoá tài khoản và dữ liệu liên quan" });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}
