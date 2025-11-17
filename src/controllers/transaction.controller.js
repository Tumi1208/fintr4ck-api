import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const getUserId = (req) => req.userId || (req.user && req.user._id);

export async function getTransactions(req, res, next) {
  try {
    const userId = getUserId(req);
    const { type, categoryId, from, to, search, limit } = req.query;

    const query = { user: userId };

    if (type && type !== "all") {
      query.type = type.toLowerCase();
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

export async function createTransaction(req, res, next) {
  try {
    const userId = getUserId(req);
    const { type, categoryId, amount, note, date } = req.body;

    if (!type || !["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    }

    if (amount == null || Number.isNaN(Number(amount))) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    const data = {
      user: userId,
      type: type.toLowerCase(),
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

export async function updateTransaction(req, res, next) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { type, categoryId, amount, note, date } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: userId });

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    if (type && ["income", "expense"].includes(type.toLowerCase())) {
      transaction.type = type.toLowerCase();
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

export async function deleteTransaction(req, res, next) {
  try {
    const userId = getUserId(req);
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

export async function getSummary(req, res, next) {
  try {
    const userId = getUserId(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totals = await Transaction.aggregate([
      { $match: { user: userObjectId } },
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

    // Lấy 5 giao dịch gần nhất để hiển thị Dashboard
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .populate("category");

    res.json({
      currentBalance,
      totalIncome,
      totalExpense,
      recentTransactions,
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
          // ĐÃ XÓA DÒNG: type: "expense" --> Để lấy cả Income và Expense
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
      total: row.amount, // Thêm trường này để frontend dễ đọc
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