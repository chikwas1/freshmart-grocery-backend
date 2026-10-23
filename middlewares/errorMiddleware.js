// middlewares/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  
  // Temporarily output the actual error message to Postman for debugging
  console.error("🔥 ERROR STACK:", err); // Prints full stack trace in your VS Code terminal

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error', // Shows the real error message
    stack: err.stack // Shows the exact line where it failed
  });
};

module.exports = errorHandler;
