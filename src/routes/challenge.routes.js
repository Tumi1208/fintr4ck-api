// src/routes/challenge.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";
import {
  createChallenge,
  getMyChallenges,
  updateChallenge,
  listChallengesForUser,
  joinChallenge,
  getMyUserChallenges,
} from "../controllers/challenge.controller.js";

const router = express.Router();

router.use(requireAuth);

// User xem danh sách challenge public hoặc do mình tạo
router.get("/", listChallengesForUser);

// User tham gia challenge
router.post("/:id/join", checkRole("USER"), joinChallenge);

// User xem challenge của mình đã tham gia
router.get("/my-challenges", checkRole("USER"), getMyUserChallenges);

// Tạo challenge (ADMIN | PARTNER)
router.post("/", checkRole("ADMIN", "PARTNER"), createChallenge);

// Lấy challenge do chính mình tạo
router.get("/mine", checkRole("ADMIN", "PARTNER"), getMyChallenges);

// Cập nhật challenge (Admin tất cả, Partner chỉ của mình)
router.patch("/:id", checkRole("ADMIN", "PARTNER"), updateChallenge);

export default router;
