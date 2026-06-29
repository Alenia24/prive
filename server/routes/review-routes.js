import express from "express";
const router = express.Router();

import * as ReviewController from "../controllers/review-controller.js";

import protect from "../middleware/authMiddleware.js";

router.get("/product/:productId", ReviewController.getProductReviews);
router.post("/product/:productId", protect, ReviewController.addReview);
router.put("/review/:id", protect, ReviewController.updateReview);
router.delete("/review/:id", protect, ReviewController.deleteReview);

export default router;
