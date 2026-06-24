import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],
    material: {
      type: String,
      trim: true,
    },
    gemstone: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 70,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
  },
  { timestamps: true },
);

productSchema.index({
  name: "text",
  description: "text",
  material: "text",
  gemstone: "text",
});

// Generate slug
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

productSchema.virtual("finalPrice").get(function () {
  return this.discountPrice || this.price;
});

productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.set("toObject", {
  virtuals: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
