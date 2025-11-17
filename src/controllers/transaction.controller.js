// src/controllers/transaction.controller.js
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// Lấy danh sách giao dịch với filter
export async function getTransactions(req, res, next) {
  try {
    const userId = req.userId;
    const { type, category, q, dateFrom, dateTo } = req.query;

    const filter = { user: userId };

    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.note = { $regex: q, $options: "i" };
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

// Tạo giao dịch mới
export async function createTransaction(req, res, next) {
  try {
    const userId = req.userId;
    const { type, category, note, amount, date } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Số tiền phải là số dương hợp lệ" });
    }

    const transaction = await Transaction.create({
      user: userId,
      type,
      category: category || null,
      note: note || "",
      amount: numAmount,
      date: date ? new Date(date) : undefined,
    });

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
}

// Cập nhật giao dịch
export async function updateTransaction(req, res, next) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { type, category, note, amount, date } = req.body;

    const update = {};

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res
          .status(400)
          .json({ message: "Loại giao dịch không hợp lệ" });
      }
      update.type = type;
    }

    if (category !== undefined) {
      update.category = category || null;
    }

    if (note !== undefined) {
      update.note = note;
    }

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        return res
          .status(400)
          .json({ message: "Số tiền phải là số dương hợp lệ" });
      }
      update.amount = numAmount;
    }

    if (date) {
      update.date = new Date(date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: userId },
      update,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
}

// Xóa giao dịch
export async function deleteTransaction(req, res, next) {
  try {
    const userId = req.userId;
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

// Tóm tắt: tổng thu, tổng chi, số dư
export async function getSummary(req, res, next) {
  try {
    const userId = req.userId;

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    result.forEach((row) => {
      if (row._id === "income") totalIncome = row.total;
      if (row._id === "expense") totalExpense = row.total;
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (err) {
    next(err);
  }
}

// Thống kê chi tiêu theo category (cho biểu đồ doughnut)
export async function getExpenseStatsByCategory(req, res, next) {
  try {
    const userId = req.userId;

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const data = result.map((row) => ({
      category: row._id || "Uncategorized",
      totalAmount: row.totalAmount,
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
}
