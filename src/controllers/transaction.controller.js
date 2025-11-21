// src/controllers/transaction.controller.js
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const getUserId = (req) => req.userId || (req.user && req.user._id);

// --- [HÀM TÌM KIẾM NÂNG CAO] ---
export async function getTransactions(req, res, next) {
  try {
    const userId = getUserId(req);
    const { type, categoryId, search, limit } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Pipeline xử lý dữ liệu từng bước
    const pipeline = [
      // 1. Lọc theo User trước
      { $match: { user: userObjectId } },

      // 2. Nối bảng Category vào để lấy tên (Lookup)
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      // Làm phẳng mảng categoryInfo (để dễ truy cập .name)
      { 
        $unwind: { 
          path: "$categoryInfo", 
          preserveNullAndEmptyArrays: true // Giữ lại giao dịch không có category
        } 
      },

      // 3. Tạo thêm field "dateString" để tìm kiếm ngày tháng (dạng DD/MM/YYYY)
      {
        $addFields: {
          dateString: { 
            $dateToString: { format: "%d/%m/%Y", date: "$date" } 
          }
        }
      }
    ];

    // 4. Chuẩn bị điều kiện lọc
    const matchStage = {};

    // Lọc theo Type
    if (type && type !== "all") {
      matchStage.type = type.toLowerCase();
    }

    // Lọc theo Category ID
    if (categoryId) {
      matchStage.category = new mongoose.Types.ObjectId(categoryId);
    }

    // 5. TÌM KIẾM ĐA NĂNG (Search All)
    if (search && search.trim() !== "") {
      const regex = { $regex: search, $options: "i" }; // Không phân biệt hoa thường
      const isNumber = !isNaN(search); // Kiểm tra xem có phải số không

      const orConditions = [
        { note: regex },                    // Tìm trong Ghi chú
        { "categoryInfo.name": regex },     // Tìm trong Tên danh mục
        { dateString: regex }               // Tìm theo Ngày (vd: "17/11")
      ];

      if (isNumber) {
        orConditions.push({ amount: Number(search) }); // Tìm theo Số tiền chính xác
      }

      matchStage.$or = orConditions;
    }

    // Đẩy điều kiện lọc vào pipeline
    pipeline.push({ $match: matchStage });

    // 6. Sắp xếp (Mới nhất lên đầu)
    pipeline.push({ $sort: { date: -1 } });
    
    // Giới hạn số lượng (nếu có)
    if (limit) {
      pipeline.push({ $limit: Number(limit) });
    }

    // 7. Project (Định hình dữ liệu trả về cho Frontend)
    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        type: 1,
        amount: 1,
        note: 1,
        // Trả về cấu trúc category giống như populate cũ
        category: {
          _id: "$categoryInfo._id",
          name: "$categoryInfo.name",
          icon: "$categoryInfo.icon",
          type: "$categoryInfo.type"
        }
      }
    });

    const transactions = await Transaction.aggregate(pipeline);

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

// --- CÁC HÀM CRUD CƠ BẢN (GIỮ NGUYÊN) ---

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
    if (!transaction) return res.status(404).json({ message: "Không tìm thấy giao dịch" });

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
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    res.json({ message: "Đã xóa giao dịch" });
  } catch (err) {
    next(err);
  }
}

export async function deleteAllTransactions(req, res, next) {
  try {
    const userId = getUserId(req);
    const result = await Transaction.deleteMany({ user: userId });
    res.json({ message: "Đã xoá toàn bộ giao dịch của bạn", deleted: result?.deletedCount || 0 });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteTransactions(req, res, next) {
  try {
    const userId = getUserId(req);
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Danh sách giao dịch cần xoá không hợp lệ" });
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length) {
      return res.status(400).json({ message: "Có giao dịch không hợp lệ, vui lòng thử lại" });
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const result = await Transaction.deleteMany({ _id: { $in: objectIds }, user: userId });

    res.json({ message: "Đã xoá giao dịch đã chọn", deleted: result?.deletedCount || 0 });
  } catch (err) {
    next(err);
  }
}

// --- CÁC HÀM DASHBOARD (GIỮ NGUYÊN LOGIC MỚI NHẤT) ---

export async function getSummary(req, res, next) {
  try {
    const userId = getUserId(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totals = await Transaction.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    for (const item of totals) {
      if (item._id === "income") totalIncome = item.total;
      if (item._id === "expense") totalExpense = item.total;
    }
    const currentBalance = totalIncome - totalExpense;

    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 }).limit(5).populate("category");

    res.json({ currentBalance, totalIncome, totalExpense, recentTransactions });
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
          // Đã xóa type: 'expense' để lấy cả Income
          category: { $ne: null },
        },
      },
      {
        $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "categoryInfo" },
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

    const data = rows.map((row) => ({ name: row.name, amount: row.amount, total: row.amount }));
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
  deleteAllTransactions,
  bulkDeleteTransactions,
  getSummary,
  getExpenseBreakdown,
};
