// src/controllers/category.controller.js
import Category from "../models/Category.js";

export async function getCategories(req, res, next) {
  try {
    const userId = req.userId;

    const categories = await Category.find({ user: userId }).sort({
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
    const userId = req.userId;
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name và type là bắt buộc" });
    }

    const category = await Category.create({
      user: userId,
      name,
      type,
      icon: icon || "",
    });

    res.status(201).json(category);
  } catch (err) {
    // handle lỗi unique index trùng name + type
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Danh mục này đã tồn tại cho user hiện tại" });
    }
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, type, icon } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, user: userId },
      { name, type, icon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const category = await Category.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    // TODO: Nếu muốn, có thể thêm bước: set category của Transaction về null

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
