// src/controllers/challenge.controller.js
import Challenge from "../models/Challenge.js";

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
