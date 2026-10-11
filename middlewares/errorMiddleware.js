const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    message = `Invalid format for field: ${err.path}`;
    statusCode = 400;
  }

  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;  
  }
  next(err); // Pass the error to the next middleware (if any)

  ApiResponse.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = errorHandler;
