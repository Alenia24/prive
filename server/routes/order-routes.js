import express from "express";
const router = express.Router();

import * as OrderController from "../controllers/order-controller.js";

import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

// User routes
router.get("/my-orders", protect, OrderController.getMyOrders);
router.get("/:id", protect, OrderController.getOrder);
router.post("/", protect, OrderController.createOrder);
router.put("/:id/cancel", protect, OrderController.cancelOrder);

//Admin routes
router.get("/", protect, isAdmin, OrderController.getAllOrders);
router.put("/:id/status", protect, isAdmin, OrderController.updateOrderStatus);

export default router;
