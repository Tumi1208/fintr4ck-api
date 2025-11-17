// src/routes/user.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  updateProfile,
  changePassword,
  deleteMe,
} from "../controllers/user.controller.js";

const router = Router();

router.use(requireAuth);

router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.delete("/me", deleteMe);

export default router;
