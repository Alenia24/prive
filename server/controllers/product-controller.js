import Product from "../models/product.js";
import slugify from "slugify";

async function getProducts(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const searchFilter = req.query.search
      ? {
          $text: {
            $search: req.query.search,
          },
        }
      : {};

    const filter = {
      isActive: true,
      ...searchFilter,
    };

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function createProduct(req, res) {
  try {
    const slug = slugify(req.body.name, {
      lower: true,
      strict: true,
    });

    const existingProduct = await Product.findOne({
      $or: [{ sku: req.body.sku }, { slug }],
    });

    if (existingProduct) {
      return res
        .status(409)
        .json({ success: false, message: "Product already exists." });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product archived successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
