import Category from "../models/category.js";
import slugify from "slugify";

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ created: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found." });
    }

    res.status(200).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Category.findOne({ $or: [{ name }, { slug }] });

    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists." });
    }

    const category = await Category.create({
      name,
      description,
    });

    return res.status(201).json({
      sucess: true,
      message: "Category created successfully.",
      category,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateCategory(req, res) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    category.isActive=false;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category archived successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
