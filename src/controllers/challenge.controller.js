// src/controllers/challenge.controller.js
import Challenge from "../models/Challenge.js";
import UserChallenge from "../models/UserChallenge.js";
import User from "../models/User.js";

export async function listChallenges(req, res, next) {
  try {
    const list = await Challenge.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function joinChallenge(req, res, next) {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);
    if (!challenge || !challenge.isActive) return res.status(404).json({ message: "Challenge không tồn tại" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "User không tồn tại" });

    const exists = await UserChallenge.findOne({ user: req.userId, challenge: id, status: "ACTIVE" });
    if (exists) return res.status(400).json({ message: "Bạn đã tham gia challenge này" });

    const now = new Date();
    const joined = await UserChallenge.create({
      user: req.userId,
      challenge: id,
      joinedAt: now,
      startDate: now,
      status: "ACTIVE",
      currentStreak: 0,
      longestStreak: 0,
      completedDays: 0,
    });
    res.status(201).json(joined);
  } catch (err) {
    next(err);
  }
}

export async function getMyChallenges(req, res, next) {
  try {
    const list = await UserChallenge.find({ user: req.userId })
      .populate("challenge", "title type durationDays targetAmountPerDay")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

function updateStreak(userChallenge, today) {
  const startOf = (d) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  const last = userChallenge.lastCheckInDate ? startOf(userChallenge.lastCheckInDate) : null;
  const current = startOf(today);
  let diff = null;
  if (last) diff = Math.floor((current - last) / (1000 * 60 * 60 * 24));

  if (last && diff === 0) throw new Error("Bạn đã check-in hôm nay");

  if (!last) userChallenge.currentStreak = 1;
  else if (diff === 1) userChallenge.currentStreak += 1;
  else userChallenge.currentStreak = 1;

  if (userChallenge.currentStreak > userChallenge.longestStreak) {
    userChallenge.longestStreak = userChallenge.currentStreak;
  }

  userChallenge.completedDays += 1;
  userChallenge.lastCheckInDate = current;
}

export async function checkInChallenge(req, res, next) {
  try {
    const { id } = req.params;
    const uc = await UserChallenge.findOne({ _id: id, user: req.userId }).populate("challenge", "durationDays");
    if (!uc) return res.status(404).json({ message: "Không tìm thấy challenge" });
    if (uc.status !== "ACTIVE") return res.status(400).json({ message: "Challenge không ở trạng thái ACTIVE" });

    try {
      updateStreak(uc, new Date());
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const total = uc.challenge?.durationDays || 0;
    if (total && uc.completedDays >= total) uc.status = "COMPLETED";

    await uc.save();
    res.json(uc);
  } catch (err) {
    next(err);
  }
}

export async function leaveChallenge(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await UserChallenge.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy challenge" });
    res.json({ message: "Đã huỷ tham gia" });
  } catch (err) {
    next(err);
  }
}
