// src/controllers/transaction.controller.js
import Transaction from "../models/Transaction.js";

// Tạo giao dịch mới
export async function createTransaction(req, res, next) {
  try {
    const { type, categoryId, amount, note, date } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: "Thiếu loại giao dịch hoặc số tiền" });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      category: categoryId || null,
      amount,
      note,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
}

// Lấy danh sách giao dịch với filter
export async function getTransactions(req, res, next) {
  try {
    const { type, categoryId, from, to, search } = req.query;

    const filter = { user: req.userId };

    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    if (categoryId) {
      filter.category = categoryId;
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    if (search) {
      filter.note = { $regex: search, $options: "i" };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate("category");

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

// Tổng quan cho Dashboard
export async function getSummary(req, res, next) {
  try {
    const userId = req.userId;

    const agg = await Transaction.aggregate([
      { $match: { user: new Transaction().schema.path("user").cast(userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    agg.forEach((row) => {
      if (row._id === "income") totalIncome = row.total;
      if (row._id === "expense") totalExpense = row.total;
    });

    const balance = totalIncome - totalExpense;

    const recent = await Transaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("category");

    res.json({
      balance,
      totalIncome,
      totalExpense,
      recentTransactions: recent,
    });
  } catch (err) {
    next(err);
  }
}

// Breakdown chi tiêu theo category cho chart
export async function getExpenseBreakdown(req, res, next) {
  try {
    const userId = req.userId;

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new Transaction().schema.path("user").cast(userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    next(err);
  }
}
