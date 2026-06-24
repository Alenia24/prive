import express from "express";
const router = express.Router();

import * as WishlistController from "../controllers/wishlist-controller.js";

import protect from "../middleware/authMiddleware.js";

router.get("/", protect, WishlistController.getWishlist);
router.post("/product/:id", protect, WishlistController.addToWishlist);
router.delete("/product/:id", protect, WishlistController.removeFromWishlist);
router.delete("/", protect, WishlistController.clearWishlist);

export default router;
