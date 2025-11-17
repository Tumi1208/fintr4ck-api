// src/controllers/category.controller.js
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

// Lấy tất cả category của user
export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ user: req.userId }).sort({
      type: 1,
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

// Tạo category
export async function createCategory(req, res, next) {
  try {
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Thiếu tên hoặc loại danh mục" });
    }

    const category = await Category.create({
      user: req.userId,
      name,
      type,
      icon: icon || "",
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

// Cập nhật category
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, icon } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, user: req.userId },
      { name, type, icon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
}

// Xoá category
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    // Option: có thể set category của transaction liên quan về null
    await Transaction.updateMany(
      { user: req.userId, category: id },
      { $set: { category: null } }
    );

    res.json({ message: "Đã xoá danh mục" });
  } catch (err) {
    next(err);
  }
}
