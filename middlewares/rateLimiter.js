const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  handler: (req, res) => {
    ApiResponse.error(res, 'Too many login/registration attempts, please try again later.', 429);
  }
});

module.exports = { authLimiter };
