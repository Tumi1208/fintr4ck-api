// fintr4ck-api/src/controllers/transaction.controller.js
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const getUserId = (req) => req.userId || (req.user && req.user._id);

// --- CÁC HÀM CƠ BẢN (GIỮ NGUYÊN LOGIC) ---

export async function getTransactions(req, res, next) {
  try {
    const userId = getUserId(req);
    const { type, categoryId, from, to, search, limit } = req.query;
    const query = { user: userId };

    if (type && type !== "all") query.type = type.toLowerCase();
    if (categoryId) query.category = categoryId;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (search) query.note = { $regex: search, $options: "i" };

    let mongoQuery = Transaction.find(query).sort({ date: -1 }).populate("category");
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

export async function updateTransaction(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { type, categoryId, amount, note, date } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) return res.status(404).json({ message: "Không tìm thấy" });

    if (type) transaction.type = type.toLowerCase();
    if (amount != null) transaction.amount = Number(amount);
    if (note !== undefined) transaction.note = note;
    if (date) transaction.date = new Date(date);
    if (categoryId !== undefined) transaction.category = categoryId || null;

    await transaction.save();
    const populated = await transaction.populate("category");
    res.json(populated);
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    const userId = getUserId(req);
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa" });
  } catch (err) {
    next(err);
  }
}

// --- CÁC HÀM DASHBOARD (ĐÃ NÂNG CẤP) ---

export async function getSummary(req, res, next) {
  try {
    const userId = getUserId(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Tính tổng Income/Expense
    const totals = await Transaction.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: "$type", // Group theo income/expense
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of totals) {
      if (item._id.toLowerCase() === "income") totalIncome = item.total;
      if (item._id.toLowerCase() === "expense") totalExpense = item.total;
    }

    const currentBalance = totalIncome - totalExpense;

    // 2. Lấy 5 giao dịch gần nhất (Để hiện bảng Recent Transactions)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .populate("category");

    res.json({
      currentBalance,       // Frontend sẽ dùng cái này
      totalIncome,
      totalExpense,
      recentTransactions,   // Danh sách giao dịch mới nhất
    });
  } catch (err) {
    next(err);
  }
}

export async function getExpenseBreakdown(req, res, next) {
  try {
    const userId = getUserId(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const rows = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: "expense",
          category: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          name: { $first: "$categoryInfo.name" },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const data = rows.map((row) => ({
      name: row.name,
      amount: row.amount,
      total: row.amount, // Thêm field 'total' cho chắc chắn Frontend đọc được
    }));

    res.json(data); // Trả về mảng trực tiếp
  } catch (err) {
    next(err);
  }
}

export default {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getExpenseBreakdown,
};