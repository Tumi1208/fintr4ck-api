// src/controllers/transaction.controller.js
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

// Lấy danh sách giao dịch (có filter + search)
export async function getTransactions(req, res) {
  try {
    const userId = req.userId;

    const {
      type,          // income | expense
      categoryId,
      from,          // yyyy-mm-dd
      to,            // yyyy-mm-dd
      search,        // text tìm kiếm note
      limit,         // optional
      sort,          // optional
    } = req.query;

    const query = { user: userId };

    if (type === "income" || type === "expense") {
      query.type = type;
    }

    if (categoryId) {
      query.category = categoryId;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.note = { $regex: search, $options: "i" };
    }

    const findQuery = Transaction.find(query)
      .populate("category")
      .sort(sort === "asc" ? { date: 1 } : { date: -1 });

    if (limit) {
      const l = Number(limit);
      if (!Number.isNaN(l) && l > 0) findQuery.limit(l);
    }

    const transactions = await findQuery.exec();
    res.json({ transactions });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

// Tạo giao dịch mới
export async function createTransaction(req, res) {
  try {
    const userId = req.userId;
    const { type, categoryId, amount, note, date } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Loại giao dịch không hợp lệ" });
    }

    if (amount == null || Number(amount) <= 0) {
      return res.status(400).json({ message: "Số tiền phải lớn hơn 0" });
    }

    let category = null;
    if (categoryId) {
      category = await Category.findOne({ _id: categoryId, user: userId });
      if (!category) {
        return res.status(400).json({ message: "Danh mục không tồn tại" });
      }
    }

    const tx = await Transaction.create({
      user: userId,
      type,
      category: category ? category._id : undefined,
      amount,
      note: note || "",
      date: date ? new Date(date) : new Date(),
    });

    const populated = await tx.populate("category");
    res.status(201).json({ transaction: populated });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

// Cập nhật giao dịch
export async function updateTransaction(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { type, categoryId, amount, note, date } = req.body;

    const tx = await Transaction.findOne({ _id: id, user: userId });
    if (!tx) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    if (type && ["income", "expense"].includes(type)) {
      tx.type = type;
    }

    if (amount != null && Number(amount) > 0) {
      tx.amount = amount;
    }

    if (note != null) {
      tx.note = note;
    }

    if (date) {
      tx.date = new Date(date);
    }

    if (categoryId !== undefined) {
      if (!categoryId) {
        tx.category = undefined;
      } else {
        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
          return res.status(400).json({ message: "Danh mục không tồn tại" });
        }
        tx.category = category._id;
      }
    }

    await tx.save();
    const populated = await tx.populate("category");

    res.json({ transaction: populated });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

// Xoá giao dịch
export async function deleteTransaction(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const tx = await Transaction.findOneAndDelete({ _id: id, user: userId });
    if (!tx) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    res.json({ message: "Đã xoá giao dịch" });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

// Summary cho Dashboard
export async function getSummary(req, res) {
  try {
    const userId = req.userId;

    const [incomeAgg, expenseAgg, recent] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: new Transaction().constructor.db.base.Types.ObjectId(userId), type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { user: new Transaction().constructor.db.base.Types.ObjectId(userId), type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.find({ user: userId })
        .populate("category")
        .sort({ date: -1 })
        .limit(5),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    const balance = totalIncome - totalExpense;

    res.json({
      balance,
      totalIncome,
      totalExpense,
      recentTransactions: recent,
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}

// Breakdown chi tiêu theo category cho chart (Reports + Dashboard)
export async function getExpenseBreakdown(req, res) {
  try {
    const userId = req.userId;

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new Transaction().constructor.db.base.Types.ObjectId(userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Lấy thông tin category cho từng _id
    const categoryIds = result.map((r) => r._id).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } });

    const map = new Map();
    categories.forEach((c) => {
      map.set(String(c._id), c);
    });

    const data = result.map((r) => {
      const cat = map.get(String(r._id));
      return {
        categoryId: r._id,
        name: cat?.name || "Khác",
        type: cat?.type || "expense",
        total: r.total,
      };
    });

    res.json({ breakdown: data });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ message: "Đã có lỗi xảy ra trên server" });
  }
}
