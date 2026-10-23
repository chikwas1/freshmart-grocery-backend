const express = require('express');
const router = express.Router();

// 1. Ensure these controllers are exported properly in authController.js
const authController = require('../controllers/authController');

// 2. Ensure validate.js returns a function (middleware factory)
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validations/authValidation');

// 3. Optional safety check for rateLimiter/authMiddleware
const { authenticate } = require('../middlewares/authMiddleware');

// Define routes - ensure NONE of these variables evaluate to undefined
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
