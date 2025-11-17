// src/controllers/category.controller.js
import Category from "../models/Category.js";

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

export async function createCategory(req, res, next) {
  try {
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Tên và loại danh mục là bắt buộc" });
    }

    const category = await Category.create({
      user: req.userId,
      name: name.trim(),
      type,
      icon: icon || "💰",
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, icon } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, user: req.userId },
      {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(icon && { icon }),
      },
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

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Category.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ message: "Đã xóa danh mục" });
  } catch (err) {
    next(err);
  }
}
