import express from "express";
const router = express.Router();

import * as CartController from "../controllers/cart-controller.js";
import protect from "../middleware/authMiddleware.js";

router.get("/", protect, CartController.getCart);
router.post("/product/:id", protect, CartController.addToCart);
router.put("/product/:id", protect, CartController.updateCartItem);
router.delete("/product/:id", protect, CartController.removeFromCart);
router.delete("/", protect, CartController.clearCart);

export default router;
