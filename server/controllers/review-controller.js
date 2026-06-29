import mongoose from "mongoose";
import Review from "../models/review.js";
import Product from "../models/product.js";

async function getProductReviews(req, res) {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const reviews = await Review.find({ productId })
      .populate({
        path: "userId",
        select: "name",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function addReview(req, res) {
  try {
    const productId = req.params.productId;
    const { rating, comment } = req.body;

    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating  must be between 1 and 5." });
    }

    if (!comment|| typeof comment !== "string" || comment.trim().length < 3) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Comment must be at least 3 characters.",
        });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const existingReview = await Review.findOne({
      userId: req.user._id,
      productId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      productId,
      rating:numRating,
      comment,
    });

    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length
      ? Number(stats[0].averageRating.toFixed(1))
      : 0;

    const totalReviews = stats.length ? stats[0].totalReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: totalReviews,
    });

    return res
      .status(201)
      .json({ success: true, message: "Review added successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateReview(req, res) {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    const stats = await Review.aggregate([
      { $match: { productId: review.productId } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length
      ? Number(stats[0].averageRating.toFixed(1))
      : 0;

    const totalReviews = stats.length ? stats[0].totalReviews : 0;

    await Product.findByIdAndUpdate(review.productId, {
      rating: avgRating,
      numReviews: totalReviews,
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteReview(req, res) {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(reviewId);

    const stats = await Review.aggregate([
      {
        $match: { productId: new mongoose.Types.ObjectId(productId) },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length
      ? Number(stats[0].averageRating.toFixed(1))
      : 0;

    const totalReviews = stats.length ? stats[0].totalReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: totalReviews,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export { getProductReviews, addReview, updateReview, deleteReview };
