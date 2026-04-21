const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../utils/response');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return sendResponse(res, 401, false, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
        return sendResponse(res, 401, false, 'User associated with this token no longer exists');
    }

    next();
  } catch (err) {
    return sendResponse(res, 401, false, 'Not authorized to access this route');
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};
