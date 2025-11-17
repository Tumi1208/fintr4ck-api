import Category from "../models/Category.js";

const getUserId = (req) => req.userId || (req.user && req.user._id);

/**
 * GET /api/v1/categories
 */
export async function getCategories(req, res, next) {
  try {
    const userId = getUserId(req);
    console.log("🔍 Đang tìm category cho User ID:", userId);

    const categories = await Category.find({ user: userId }).sort({ name: 1 });
    
    console.log(`✅ Tìm thấy ${categories.length} danh mục.`);
    res.json(categories);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách category:", err);
    next(err);
  }
}

/**
 * POST /api/v1/categories
 */
export async function createCategory(req, res, next) {
  try {
    const userId = getUserId(req);
    let { name, type } = req.body;

    console.log("📩 Đang nhận yêu cầu tạo Category:", req.body);

    if (!name || !type) {
      console.log("⚠️ Thiếu tên hoặc type");
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    // FIX QUAN TRỌNG: Chuyển hết về chữ thường để tránh lỗi validation
    type = type.toLowerCase(); 
    console.log("🛠️ Đã chuẩn hóa type thành:", type);

    // Kiểm tra trùng
    const existing = await Category.findOne({ user: userId, name, type });
    if (existing) {
      console.log("⚠️ Danh mục đã tồn tại:", existing);
      return res.status(400).json({ message: "Danh mục này đã tồn tại" });
    }

    // Tạo mới
    const category = await Category.create({
      user: userId,
      name,
      type
    });

    console.log("✅ Đã tạo thành công:", category);
    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Lỗi KHÔNG LƯU ĐƯỢC category:", err);
    // Trả về lỗi chi tiết để Frontend hiển thị (nếu có)
    res.status(500).json({ message: err.message });
  }
}

// (Các hàm update/delete giữ nguyên hoặc copy lại từ file cũ)
export async function updateCategory(req, res, next) { /* ... */ }
export async function deleteCategory(req, res, next) { /* ... */ }

export default {
  getCategories,
  createCategory,
  updateCategory, // Nhớ export đầy đủ
  deleteCategory
};