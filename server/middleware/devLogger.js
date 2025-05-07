// server/middleware/devLogger.js

// Simple request logging middleware for development

const devLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  };
  
  module.exports = devLogger;
  

