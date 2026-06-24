import express from "express";
const router = express.Router();

import * as CategoryController from "../controllers/category-controller.js";

import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

// Public
router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategory);

// Admin only
router.post("/", protect, isAdmin, CategoryController.createCategory);
router.put("/:id", protect, isAdmin, CategoryController.updateCategory);
router.delete("/:id", protect, isAdmin, CategoryController.deleteCategory);

export default router;
