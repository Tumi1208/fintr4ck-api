// src/routes/user.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  updateProfile,
  changePassword,
  deleteMe,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(requireAuth);

// PUT /api/v1/users/profile
router.put("/profile", updateProfile);

// PUT /api/v1/users/change-password
router.put("/change-password", changePassword);

// DELETE /api/v1/users/me
router.delete("/me", deleteMe);

export default router;
