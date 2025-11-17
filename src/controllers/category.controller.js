// src/controllers/category.controller.js
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

export async function getCategories(req, res) {
  try {
    const userId = req.userId;
    const categories = await Category.find({ user: userId }).sort({ createdAt: 1 });
    res.json({ categories });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

export async function createCategory(req, res) {
  try {
    const userId = req.userId;
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Tên và loại danh mục là bắt buộc" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Loại danh mục không hợp lệ" });
    }

    const category = await Category.create({
      user: userId,
      name: name.trim(),
      type,
      icon: icon || "",
    });

    res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Danh mục này đã tồn tại" });
    }
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

export async function updateCategory(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, type, icon } = req.body;

    const category = await Category.findOne({ _id: id, user: userId });
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    if (name) category.name = name.trim();
    if (type && ["income", "expense"].includes(type)) category.type = type;
    if (icon !== undefined) category.icon = icon;

    await category.save();
    res.json({ category });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const category = await Category.findOneAndDelete({ _id: id, user: userId });
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    // Có thể optional: clear category khỏi transaction
    await Transaction.updateMany(
      { user: userId, category: id },
      { $unset: { category: "" } }
    );

    res.json({ message: "Đã xoá danh mục" });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}
