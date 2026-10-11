const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');

exports.createOrder = async (req, res) => {
  const { items } = req.body;
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return ApiResponse.error(res, `Product ${item.product} not found`, 404);
    }
    if (product.stock < item.quantity) {
      return ApiResponse.error(res, `Insufficient stock for product: ${product.name}`, 400);
    }

    product.stock -= item.quantity;
    await product.save();

    totalAmount += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount
  });

  ApiResponse.success(res, 'Order placed successfully', order, 201);
};

exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('items.product', 'name price');
  ApiResponse.success(res, 'Orders fetched successfully', orders);
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name price');
  ApiResponse.success(res, 'All orders retrieved', orders);
};

exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id, 
    { status: req.body.status }, 
    { new: true, runValidators: true }
  );
  if (!order) return ApiResponse.error(res, 'Order not found', 404);
  ApiResponse.success(res, 'Order status updated', order);
};
