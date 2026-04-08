const jwt = require('jsonwebtoken');

// Middleware to protect routes and verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);

    let message = 'Not authorized to access this route';

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }

    return res.status(401).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = protect;
