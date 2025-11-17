import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const getUserId = (req) => req.userId || (req.user && req.user._id);

export async function getTransactions(req, res, next) {
  try {
    const userId = getUserId(req);
    const { type, categoryId, from, to, search, limit } = req.query;

    const query = { user: userId };

    // FIX: Chuyển về chữ thường để tìm kiếm chính xác bất kể Frontend gửi lên kiểu gì
    if (type && type !== "all") {
      query.type = type.toLowerCase(); 
    }

    if (categoryId) query.category = categoryId;
    
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    if (search) query.note = { $regex: search, $options: "i" };

    let mongoQuery = Transaction.find(query)
      .sort({ date: -1 })
      .populate("category");

    if (limit) mongoQuery = mongoQuery.limit(Number(limit));

    const transactions = await mongoQuery;
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const userId = getUserId(req);
    const { type, categoryId, amount, note, date } = req.body;

    // FIX: Luôn lưu type dạng chữ thường (income/expense) để thống nhất
    const cleanType = type ? type.toLowerCase() : "expense";

    if (!["income", "expense"].includes(cleanType)) {
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    }

    const data = {
      user: userId,
      type: cleanType,
      amount: Number(amount),
      note: note || "",
      date: date ? new Date(date) : new Date(),
    };

    if (categoryId) data.category = categoryId;

    const transaction = await Transaction.create(data);
    const populated = await transaction.populate("category");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// ... (Các hàm update/delete giữ nguyên, chỉ cần sửa getSummary dưới đây)

export async function getSummary(req, res, next) {
  try {
    const userId = getUserId(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totals = await Transaction.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: "$type", // Group theo type (lưu ý trong DB phải chuẩn lowercase)
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    // Duyệt mảng kết quả để gán vào biến
    for (const item of totals) {
      // Chấp nhận cả "income" thường và "Income" hoa để tránh lỗi
      if (item._id.toLowerCase() === "income") totalIncome = item.total;
      if (item._id.toLowerCase() === "expense") totalExpense = item.total;
    }

    const currentBalance = totalIncome - totalExpense;

    res.json({
      currentBalance, // Tên biến 1
      balance: currentBalance, // FIX: Thêm tên biến dự phòng cho Frontend
      totalBalance: currentBalance, // FIX: Thêm tên biến dự phòng nữa
      totalIncome,
      totalExpense,
    });
  } catch (err) {
    next(err);
  }
}

// ... (Giữ nguyên getExpenseBreakdown)
// Nhớ export đầy đủ các hàm (update, delete...) nếu bạn giữ lại code cũ của chúng.
export async function updateTransaction(req, res, next) { /* Code cũ */ }
export async function deleteTransaction(req, res, next) { /* Code cũ */ }
export async function getExpenseBreakdown(req, res, next) { /* Code cũ đã fix ở bước trước */ }

export default {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getExpenseBreakdown,
};