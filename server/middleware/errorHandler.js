// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack || err.message);
  
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
    res.status(statusCode).json({
      message: err.message || 'An unknown error occurred',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  };
  
  module.exports = errorHandler;
  