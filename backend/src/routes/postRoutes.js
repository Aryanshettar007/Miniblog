const express = require('express');
const { check, validationResult } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  publishPost,
  unpublishPost
} = require('../controllers/postController');

const { protect, authorize } = require('../middleware/auth');
const sendResponse = require('../utils/response');

const router = express.Router();

// Middleware to check validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Validation Failed', errors.array());
  }
  next();
};

// Optional protect middleware helper
// We want `getPost` to be public for published posts, but require auth for drafts.
// So we use a custom middleware inside getPost or a softer protect that just populates req.user without throwing if unauthenticated.
// Since protect throws, we'll configure a "softProtect" for the single post route if needed, 
// but for simplicity, we do the check manually inside the controller using decoding.
// Actually, `protect` would block unauthenticated users entirely.
// Let's create a softProtect here to populate user if token exists.

const softProtect = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (e) {}
  }
  next();
};

router
  .route('/')
  .get(getPosts)
  .post(
    protect,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ],
    validateResults,
    createPost
  );

router.get('/me', protect, getMyPosts);

router
  .route('/:id')
  .get(softProtect, getPost)
  .put(
    protect,
    [
      check('title', 'Title cannot be empty').optional().not().isEmpty(),
      check('content', 'Content cannot be empty').optional().not().isEmpty()
    ],
    validateResults,
    updatePost
  )
  .delete(protect, deletePost);

router.patch('/:id/publish', protect, publishPost);
router.patch('/:id/unpublish', protect, unpublishPost);

module.exports = router;
