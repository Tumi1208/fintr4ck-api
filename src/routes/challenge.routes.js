// src/routes/challenge.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listChallenges,
  joinChallenge,
  getMyChallenges,
  checkInChallenge,
} from "../controllers/challenge.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listChallenges);
router.post("/:id/join", joinChallenge);
router.get("/my-challenges", getMyChallenges);
router.post("/my-challenges/:id/check-in", checkInChallenge);

export default router;
