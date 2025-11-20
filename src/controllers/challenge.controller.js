// src/controllers/challenge.controller.js
import Challenge from "../models/Challenge.js";
import UserChallenge from "../models/UserChallenge.js";
import User from "../models/User.js";

export async function createChallenge(req, res, next) {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      durationDays: req.body.durationDays,
      targetAmountPerDay: req.body.targetAmountPerDay,
      isPublic: req.body.isPublic,
      startDate: req.body.startDate,
      createdBy: req.userId,
    };
    const challenge = await Challenge.create(payload);
    res.status(201).json(challenge);
  } catch (err) {
    next(err);
  }
}

export async function getMyChallenges(req, res, next) {
  try {
    const list = await Challenge.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function updateChallenge(req, res, next) {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ message: "Challenge không tồn tại" });

    // Admin được sửa tất cả, Partner chỉ sửa của mình
    if (req.userRole !== "ADMIN" && String(challenge.createdBy) !== String(req.userId)) {
      return res.status(403).json({ message: "Bạn không có quyền sửa challenge này" });
    }

    const fields = ["title", "description", "type", "durationDays", "targetAmountPerDay", "isPublic", "startDate"];
    fields.forEach((key) => {
      if (req.body[key] !== undefined) challenge[key] = req.body[key];
    });

    await challenge.save();
    res.json(challenge);
  } catch (err) {
    next(err);
  }
}

export async function listChallengesForUser(req, res, next) {
  try {
    const filter = {
      $or: [{ isPublic: true }, { createdBy: req.userId }],
    };
    if (req.query.type) {
      filter.type = req.query.type;
    }
    const list = await Challenge.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function joinChallenge(req, res, next) {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ message: "Challenge không tồn tại" });

    // Nếu không public, chỉ cho phép owner (hoặc sau này thêm logic)
    if (!challenge.isPublic && String(challenge.createdBy) !== String(req.userId)) {
      return res.status(403).json({ message: "Bạn không được tham gia challenge này" });
    }

    // Kiểm tra user role có phải USER
    const user = await User.findById(req.userId);
    if (!user || user.role !== "USER") {
      return res.status(403).json({ message: "Chỉ người dùng USER mới tham gia challenge" });
    }

    const existing = await UserChallenge.findOne({
      user: req.userId,
      challenge: id,
      status: "ACTIVE",
    });
    if (existing) {
      return res.status(400).json({ message: "Bạn đã tham gia challenge này rồi" });
    }

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

export async function getMyUserChallenges(req, res, next) {
  try {
    const list = await UserChallenge.find({ user: req.userId })
      .populate("challenge", "title type durationDays targetAmountPerDay")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
}
