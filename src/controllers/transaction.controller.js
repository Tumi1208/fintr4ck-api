// src/controllers/transaction.controller.js
import Transaction from "../models/Transaction.js";

/**
 * GET /api/v1/transactions
 * Hỗ trợ filter: type, categoryId, from, to, search, limit
 */
export async function getTransactions(req, res, next) {
  try {
    const userId = req.user._id || req.userId;

    const { type, categoryId, from, to, search, limit } = req.query;

    const query = { user: userId };

    if (type && type !== "all") {
      query.type = type;
    }

    if (categoryId) {
      query.category = categoryId;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    if (search) {
      query.note = { $regex: search, $options: "i" };
    }

    let mongoQuery = Transaction.find(query)
      .sort({ date: -1 })
      .populate("category");

    if (limit) {
      mongoQuery = mongoQuery.limit(Number(limit));
    }

    const transactions = await mongoQuery;

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/transactions
 * Body: { type, categoryId, amount, note, date }
 */
export async function createTransaction(req, res, next) {
  try {
    const userId = req.user._id || req.userId;
    const { type, categoryId, amount, note, date } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    }

    if (amount == null || Number.isNaN(Number(amount))) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    const data = {
      user: userId,
      type,
      amount: Number(amount),
      note: note || "",
      date: date ? new Date(date) : new Date(),
    };

    if (categoryId) {
      data.category = categoryId;
    }

    const transaction = await Transaction.create(data);
    const populated = await transaction.populate("category");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/transactions/:id
 */
export async function updateTransaction(req, res, next) {
  try {
    const userId = req.user._id || req.userId;
    const { id } = req.params;
    const { type, categoryId, amount, note, date } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: userId });

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    if (type && ["income", "expense"].includes(type)) {
      transaction.type = type;
    }

    if (amount != null && !Number.isNaN(Number(amount))) {
      transaction.amount = Number(amount);
    }

    if (note !== undefined) {
      transaction.note = note;
    }

    if (date) {
      transaction.date = new Date(date);
    }

    if (categoryId !== undefined) {
      transaction.category = categoryId || null;
    }

    await transaction.save();
    const populated = await transaction.populate("category");

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/transactions/:id
 */
export async function deleteTransaction(req, res, next) {
  try {
    const userId = req.user._id || req.userId;
    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    res.json({ message: "Đã xóa giao dịch" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/transactions/summary
 * Trả về: currentBalance, totalIncome, totalExpense
 */
export async function getSummary(req, res, next) {
  try {
    const userId = req.user._id || req.userId;

    const totals = await Transaction.aggregate([
      { $match: { user: userId } }, // KHÔNG dùng ObjectId, để mongoose tự cast
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of totals) {
      if (item._id === "income") totalIncome = item.total;
      if (item._id === "expense") totalExpense = item.total;
    }

    const currentBalance = totalIncome - totalExpense;

    res.json({
      currentBalance,
      totalIncome,
      totalExpense,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reports/expense-breakdown
 * Trả về mảng: [{ name, amount }]
 * Dùng cho biểu đồ "Expenses by Category" trên Dashboard
 */
export async function getExpenseBreakdown(req, res, next) {
  try {
    const userId = req.user._id || req.userId;

    const rows = await Transaction.aggregate([
      {
        $match: {
          user: userId, // KHÔNG dùng ObjectId ở đây
          type: "expense",
          category: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          name: { $first: "$category.name" },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const data = rows.map((row) => ({
      name: row.name,
      amount: row.amount,
    }));

    res.json(data);
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
