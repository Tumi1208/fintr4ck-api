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

router.use(requireAuth);

// GET /api/v1/categories
router.get("/", getCategories);

// POST /api/v1/categories
router.post("/", createCategory);

// PUT /api/v1/categories/:id
router.put("/:id", updateCategory);

// DELETE /api/v1/categories/:id
router.delete("/:id", deleteCategory);

export default router;
