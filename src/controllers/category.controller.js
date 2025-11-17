import Category from "../models/Category.js";

// Helper để lấy userId an toàn (ưu tiên req.userId từ middleware)
const getUserId = (req) => {
  return req.userId || (req.user && req.user._id);
};

/**
 * GET /api/v1/categories
 * Lấy danh sách danh mục của User hiện tại
 */
export async function getCategories(req, res, next) {
  try {
    const userId = getUserId(req);
    
    // Tìm category của user này, sắp xếp theo tên A-Z
    const categories = await Category.find({ user: userId }).sort({ name: 1 });
    
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/categories
 * Tạo danh mục mới
 */
export async function createCategory(req, res, next) {
  try {
    const userId = getUserId(req);
    const { name, type } = req.body; // type: 'income' hoặc 'expense'

    if (!name || !type) {
      return res.status(400).json({ message: "Thiếu tên hoặc loại danh mục" });
    }

    // Kiểm tra xem danh mục đã tồn tại chưa (trong phạm vi user đó)
    const existing = await Category.findOne({ user: userId, name, type });
    if (existing) {
      return res.status(400).json({ message: "Danh mục này đã tồn tại" });
    }

    const category = await Category.create({
      user: userId,
      name,
      type
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/categories/:id
 * Cập nhật danh mục
 */
export async function updateCategory(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { name, type } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, user: userId },
      { name, type },
      { new: true } // Trả về document mới sau khi update
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/categories/:id
 * Xóa danh mục
 */
export async function deleteCategory(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const deleted = await Category.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ message: "Đã xóa danh mục" });
  } catch (err) {
    next(err);
  }
}

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};