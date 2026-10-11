const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ApiResponse = require('../utils/apiResponse');

// Cache token blacklist for in-memory logout tracking
const tokenBlacklist = new Set();

const authenticate = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Authentication token missing', 401);
  }

  if (tokenBlacklist.has(token)) {
    return ApiResponse.error(res, 'Token is invalidated/logged out', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User no longer exists', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Forbidden: Insufficient privileges', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize, tokenBlacklist };
