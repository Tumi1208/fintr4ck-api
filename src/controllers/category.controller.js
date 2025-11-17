import Category from "../models/Category.js";

const getUserId = (req) => req.userId || (req.user && req.user._id);

/**
 * GET /api/v1/categories
 */
export async function getCategories(req, res, next) {
  try {
    const userId = getUserId(req);
    // Sắp xếp theo tên A-Z
    const categories = await Category.find({ user: userId }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(" Lỗi lấy danh sách category:", err);
    next(err);
  }
}

/**
 * POST /api/v1/categories
 * (ĐÃ SỬA: Thêm icon vào để lưu)
 */
export async function createCategory(req, res, next) {
  try {
    const userId = getUserId(req);
    // [FIX] Lấy thêm biến 'icon' từ req.body
    let { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Thiếu thông tin name hoặc type" });
    }

    // Chuẩn hóa type về chữ thường
    type = type.toLowerCase(); 

    // Kiểm tra trùng tên
    const existing = await Category.findOne({ user: userId, name, type });
    if (existing) {
      return res.status(400).json({ message: "Danh mục này đã tồn tại" });
    }

    // Tạo mới với icon
    const category = await Category.create({
      user: userId,
      name,
      type,
      icon: icon || "" // [FIX] Lưu icon, nếu không có thì để rỗng
    });

    console.log(" Đã tạo category có icon:", category);
    res.status(201).json(category);
  } catch (err) {
    console.error(" Lỗi tạo category:", err);
    next(err);
  }
}

/**
 * PUT /api/v1/categories/:id
 * (ĐÃ SỬA: Cho phép update icon)
 */
export async function updateCategory(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    // [FIX] Lấy thêm icon để update
    const { name, type, icon } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, user: userId },
      { name, type, icon }, // [FIX] Cập nhật trường icon
      { new: true } // Trả về dữ liệu mới sau khi sửa
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