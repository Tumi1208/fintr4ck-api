// scripts/seedChallenges.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import Challenge from "../src/models/Challenge.js";

dotenv.config();

const seeds = [
  {
    title: "30 ngày không mua trà sữa",
    type: "NO_SPEND",
    durationDays: 30,
    targetAmountPerDay: null,
    description:
      "Mỗi lần bỏ qua một ly trà sữa là bạn đang để dành 30.000–60.000đ cho mục tiêu lớn hơn. Thử 30 ngày không mua trà sữa để xem bạn tiết kiệm được bao nhiêu.",
  },
  {
    title: "Tiết kiệm 100.000đ mỗi ngày trong 30 ngày",
    type: "SAVE_FIXED",
    durationDays: 30,
    targetAmountPerDay: 100000,
    description:
      "Mỗi ngày cất riêng 100.000đ. Sau 30 ngày bạn đã có 3.000.000đ để dành cho điều mình thật sự muốn.",
  },
  {
    title: "7 ngày chỉ ăn ở nhà",
    type: "NO_SPEND",
    durationDays: 7,
    targetAmountPerDay: null,
    description:
      "Tạm nghỉ ăn ngoài trong 7 ngày, ví của bạn sẽ cảm ơn bạn ngay lập tức.",
  },
  {
    title: "14 ngày không mua đồ online",
    type: "NO_SPEND",
    durationDays: 14,
    targetAmountPerDay: null,
    description:
      "Tạm dừng giỏ hàng trong 14 ngày để phân biệt đâu là nhu cầu thật, đâu là ham muốn nhất thời.",
  },
  {
    title: "21 ngày ghi chép chi tiêu đầy đủ",
    type: "CUSTOM",
    durationDays: 21,
    targetAmountPerDay: null,
    description:
      "Mỗi ngày dành 3 phút ghi lại mọi khoản thu chi. Nhìn rõ tiền đi đâu, bạn sẽ biết nên làm gì tiếp theo.",
  },
];

async function seed() {
  await connectDB();
  try {
    for (const item of seeds) {
      const existing = await Challenge.findOne({ title: item.title });
      if (existing) {
        console.log(`Skipped existing challenge: ${item.title}`);
        continue;
      }
      await Challenge.create({ ...item, isActive: true });
      console.log(`Created challenge: ${item.title}`);
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
