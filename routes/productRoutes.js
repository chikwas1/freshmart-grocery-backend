const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { productSchema, updateProductSchema } = require('../validations/productValidation');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin-only CRUD operations
router.post('/', authenticate, authorize('admin'), validate(productSchema), productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
