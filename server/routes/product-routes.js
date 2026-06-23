import express from "express";
const router = express.Router();

import * as ProductController from "../controllers/product-controller.js";

import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

// Public routes
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProduct);

// Admin routes
router.post("/", protect, isAdmin, ProductController.createProduct);
router.put("/:id", protect, isAdmin, ProductController.updateProduct);
router.delete("/:id", protect, isAdmin, ProductController.deleteProduct);

export default router;
