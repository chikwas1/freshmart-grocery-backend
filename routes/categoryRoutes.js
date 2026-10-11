const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { categorySchema } = require('../validations/categoryValidation');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only CRUD operations
router.post('/', authenticate, authorize('admin'), validate(categorySchema), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), validate(categorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
