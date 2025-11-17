// src/routes/category.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// tất cả route dưới đây đều yêu cầu đăng nhập
router.use(requireAuth);

router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
