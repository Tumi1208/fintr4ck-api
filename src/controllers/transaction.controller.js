// Controller xử lý logic cho các API giao dịch

import Transaction from "../models/Transaction.js";

// POST /transactions
export async function createTransaction(req, res, next) {
  try {
    const userId = req.userId; // lấy từ middleware auth
    const { type, amount, description } = req.body;

    // kiểm tra dữ liệu cơ bản
    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    }

    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber <= 0) {
      return res
        .status(400)
        .json({ message: "Số tiền phải là số lớn hơn 0" });
    }

    const tx = await Transaction.create({
      user: userId,
      type,
      amount: amountNumber,
      description: description || "",
    });

    return res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
}

// GET /transactions
export async function getTransactions(req, res, next) {
  try {
    const userId = req.userId;

    const list = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

// DELETE /transactions/:id
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

    return res.json({ message: "Đã xóa giao dịch" });
  } catch (err) {
    next(err);
  }
}
