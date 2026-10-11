const User = require('../models/user');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const { tokenBlacklist } = require('../middlewares/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'Email already registered', 400);
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  ApiResponse.success(res, 'User registered successfully', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  }, 201);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  ApiResponse.success(res, 'Login successful', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
};

exports.logout = async (req, res) => {
  tokenBlacklist.add(req.token);
  ApiResponse.success(res, 'Logged out successfully');
};
