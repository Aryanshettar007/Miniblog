const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../utils/response');

// Prevent unhandled promise rejections without try-catch everywhere
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Validation results are checked in routes middleware

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(res, 400, false, 'User already exists with this email');
  }

  // Create user
  // We only allow creating 'user' roles by default to prevent privilege escalation via API
  // Creating an admin should be done directly in DB or via a protected admin-only route
  const assignedRole = role === 'admin' ? 'user' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole
  });

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return sendResponse(res, 400, false, 'Please provide an email and password');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return sendResponse(res, 401, false, 'Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return sendResponse(res, 401, false, 'Invalid credentials');
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  sendResponse(res, 200, true, 'User fetched successfully', user);
});

// Helper to get token from model, create response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Remove password from output just in case
  user.password = undefined;

  sendResponse(res, statusCode, true, 'Authentication successful', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
