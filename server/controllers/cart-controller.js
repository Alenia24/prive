import Cart from "../models/cart.js";
import Product from "../models/product.js";

async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
    }).populate({
      path: "items.product",
      select: "name price images stock rating",
    });

    return res.status(200).json({ success: true, cart: cart || { items: [] } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function addToCart(req, res) {
  try {
    const productId = req.params.id;
    const { quantity = 1 } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1." });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      const newCart = await Cart.create({
        userId: req.user._id,
        items: [{ product: productId, quantity }],
      });

      return res.status(201).json({
        success: true,
        message: "Product added to cart.",
        cart: newCart,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Cart Updated.", cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateCartItem(req, res) {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be atleast 1." });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    item.quantity = quantity;

    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Cart Updated.", cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function removeFromCart(req, res) {
  try {
    const productId = req.params.id;

    const cart = await Cart.findOneAndUpdate(
      {
        userId: req.user._id,
      },
      {
        $pull: {
          items: {
            product: productId,
          },
        },
      },
      { new: true },
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: " Product removed from cart.", cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true },
    );

    return res
      .status(200)
      .json({ success: true, message: "Cart cleared.", cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
