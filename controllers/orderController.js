// src/controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order with atomic stock updates and duplicate prevention
// @route   POST /orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    // 1. Aggregate duplicate product IDs to prevent race conditions & bypasses
    const quantitiesByProduct = new Map();
    for (const item of items) {
      const productId = String(item.product);
      const qty = Number(item.quantity);

      if (!Number.isInteger(qty) || qty < 1) {
        throw new Error('Quantity must be a positive integer');
      }

      quantitiesByProduct.set(productId, (quantitiesByProduct.get(productId) || 0) + qty);
    }

    let calculatedTotalPrice = 0;
    const verifiedOrderItems = [];

    // 2. Fetch current prices from database and validate stock atomically inside transaction
    for (const [productId, totalRequestedQty] of quantitiesByProduct.entries()) {
      const product = await Product.findById(productId).session(session);

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      if (product.stock < totalRequestedQty) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      // Deduct stock conditionally ensuring atomic stock check
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: totalRequestedQty } },
        { $inc: { stock: -totalRequestedQty } },
        { new: true, session }
      );

      if (!updatedProduct) {
        throw new Error(`Product unavailable or insufficient stock during checkout: ${product.name}`);
      }

      calculatedTotalPrice += product.price * totalRequestedQty;
      verifiedOrderItems.push({
        product: product._id,
        quantity: totalRequestedQty,
        price: product.price // Always use server-side database price
      });
    }

    // 3. Create the order
    const order = await Order.create([{
      user: req.user._id,
      items: verifiedOrderItems,
      totalPrice: calculatedTotalPrice,
      shippingAddress,
      status: 'Pending'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Order creation failed'
    });
  }
};

// @desc    Get all orders (Admin or User specific)
// @route   GET /orders
// @access  Private
exports.getAllOrders = async (req, res, next) => {
  try {
    let query = {};
    // If not admin, restrict orders to the logged-in user
    if (req.user.role !== 'admin') {
      query = { user: req.user._id };
    }

    const orders = await Order.find(query).populate('user', 'name email').populate('items.product', 'name price');

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure users can only view their own orders unless they are admin
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// P2 FIX: Define allowed state transition matrix
const allowedTransitions = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const canTransition = (currentStatus, nextStatus) => {
  return (allowedTransitions[currentStatus] || []).includes(nextStatus);
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!canTransition(order.status, newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${newStatus}`
      });
    }

    order.status = newStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
