const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { orderSchema, updateOrderStatusSchema } = require('../validations/orderValidation');

router.post('/', authenticate, validate(orderSchema), orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getUserOrders);

// Admin operations
router.get('/', authenticate, authorize('admin'), orderController.getAllOrders);
router.patch('/:id/status', authenticate, authorize('admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;

