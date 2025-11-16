// src/controllers/transaction.controller.js
// Các logic CRUD cho giao dịch và thống kê đơn giản

import Transaction from "../models/Transaction.js";

// Lấy danh sách giao dịch của user
export async function getTransactions(req, res, next) {
  try {
    const list = await Transaction.find({ user: req.userId }).sort({
      date: -1
    });
    return res.json({ data: list });
  } catch (err) {
    next(err);
  }
}

// Tạo giao dịch mới
export async function createTransaction(req, res, next) {
  const { type, category, amount, date, note } = req.body;

  try {
    if (!type || !amount || !date) {
      return res
        .status(400)
        .json({ message: "Thiếu type, amount hoặc date." });
    }

    const tx = await Transaction.create({
      user: req.userId,
      type,
      category,
      amount,
      date,
      note
    });

    return res.status(201).json({ data: tx });
  } catch (err) {
    next(err);
  }
}

// Cập nhật giao dịch
export async function updateTransaction(req, res, next) {
  const { id } = req.params;
  const { type, category, amount, date, note } = req.body;

  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: id, user: req.userId },
      { type, category, amount, date, note },
      { new: true }
    );

    if (!tx) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch." });
    }

    return res.json({ data: tx });
  } catch (err) {
    next(err);
  }
}

// Xóa giao dịch
export async function deleteTransaction(req, res, next) {
  const { id } = req.params;

  try {
    const tx = await Transaction.findOneAndDelete({
      _id: id,
      user: req.userId
    });

    if (!tx) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch." });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Tính thống kê: tổng thu, tổng chi, số dư
export async function getSummary(req, res, next) {
  try {
    const list = await Transaction.find({ user: req.userId });

    let totalIncome = 0;
    let totalExpense = 0;

    list.forEach((tx) => {
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense") totalExpense += tx.amount;
    });

    const balance = totalIncome - totalExpense;

    return res.json({
      totalIncome,
      totalExpense,
      balance
    });
  } catch (err) {
    next(err);
  }
}
