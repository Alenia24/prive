import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";

async function getWishlist(req, res) {
  try {
    const wishlist = await Wishlist.findOne({
      userId: req.user._id,
    }).populate({
      path: "items.product",
      select: "name price images stock rating",
    });

    return res
      .status(200)
      .json({ success: true, wishlist: wishlist || { items: [] } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function addToWishlist(req, res) {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const exists = await Wishlist.findOne({
      userId: req.user._id,
      "items.product": productId,
    });

    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in wishlist." });
    }

    const updated = await Wishlist.findOneAndUpdate(
      {
        userId: req.user._id,
      },
      {
        $addToSet: {
          items: { product: productId },
        },
      },
      { new: true, upsert: true },
    );

    return res
      .status(201)
      .json({ success: true, message: "Product added to wishlist.", wishlist: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const productId = req.params.id;

    const updated = await Wishlist.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { items: { product: productId } } },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      wishlist: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function clearWishlist(req, res) {
  try {
    const updated = await Wishlist.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true },
    );

    return res
      .status(200)
      .json({ success: true, message: "Wishlist cleared.", wishlist: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
