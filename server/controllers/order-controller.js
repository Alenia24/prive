import Order from "../models/order.js";

async function getAllOrders(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalOrders = await Order.countDocuments();

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("products.productId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const isOwner = order.userId._id.toString() === req.user.id;

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createOrder(req, res) {
  try {
    const order = await Order.create({ ...req.body, userId: req.user.id });

    return res
      .status(201)
      .json({ success: true, message: "Order created successfully.", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(req.body.orderStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a cancelled order.",
      });
    }

    order.orderStatus = req.body.orderStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function cancelOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const isOwner = order.userId.toString() === req.user.id;

    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const cancellable = ["Pending"];

    if (!cancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage.",
      });
    }

    order.orderStatus = "Cancelled";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export {
  getAllOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};
