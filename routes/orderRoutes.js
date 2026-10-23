const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Ensure that every controller method used here exists in orderController.js
router.route('/')
  .post(authenticate, orderController.createOrder)
  .get(authenticate, authorize('admin'), orderController.getAllOrders); // Check line 9 here

router.route('/:id')
  .get(authenticate, orderController.getOrderById);

module.exports = router;
