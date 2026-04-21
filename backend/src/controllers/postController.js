const Post = require('../models/Post');
const sendResponse = require('../utils/response');

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get all published posts
 * @route   GET /api/v1/posts
 * @access  Public
 */
exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ status: 'published' }).populate({
    path: 'author',
    select: 'name email role'
  });

  sendResponse(res, 200, true, 'Published posts fetched successfully', posts);
});

/**
 * @desc    Get current user's posts
 * @route   GET /api/v1/posts/me
 * @access  Private
 */
exports.getMyPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ author: req.user.id });

  sendResponse(res, 200, true, 'Your posts fetched successfully', posts);
});

/**
 * @desc    Get single post
 * @route   GET /api/v1/posts/:id
 * @access  Public
 */
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'author',
    select: 'name email role'
  });

  if (!post) {
    return sendResponse(res, 404, false, 'Post not found');
  }

  // If draft, only author or admin can view
  if (post.status === 'draft') {
    if (!req.user || (post.author._id.toString() !== req.user.id && req.user.role !== 'admin')) {
      return sendResponse(res, 403, false, 'Not authorized to view this draft');
    }
  }

  sendResponse(res, 200, true, 'Post fetched successfully', post);
});

/**
 * @desc    Create new post
 * @route   POST /api/v1/posts
 * @access  Private
 */
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.author = req.user.id;

  const post = await Post.create(req.body);

  sendResponse(res, 201, true, 'Post created successfully', post);
});

/**
 * @desc    Update post
 * @route   PUT /api/v1/posts/:id
 * @access  Private
 */
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return sendResponse(res, 404, false, 'Post not found');
  }

  // Make sure user is post author (admins can't edit, only delete/unpublish)
  if (post.author.toString() !== req.user.id) {
    return sendResponse(res, 403, false, 'User not authorized to update this post');
  }

  // Prevent changing author
  if (req.body.author) {
    delete req.body.author;
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendResponse(res, 200, true, 'Post updated successfully', post);
});

/**
 * @desc    Delete post
 * @route   DELETE /api/v1/posts/:id
 * @access  Private
 */
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendResponse(res, 404, false, 'Post not found');
  }

  // Make sure user is post author or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'User not authorized to delete this post');
  }

  await post.deleteOne();

  sendResponse(res, 200, true, 'Post deleted successfully', {});
});

/**
 * @desc    Publish post (Author)
 * @route   PATCH /api/v1/posts/:id/publish
 * @access  Private
 */
exports.publishPost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return sendResponse(res, 404, false, 'Post not found');
  }

  if (post.author.toString() !== req.user.id) {
    return sendResponse(res, 403, false, 'User not authorized to publish this post');
  }

  post.status = 'published';
  await post.save();

  sendResponse(res, 200, true, 'Post published successfully', post);
});

/**
 * @desc    Unpublish post (Author or Admin Moderation)
 * @route   PATCH /api/v1/posts/:id/unpublish
 * @access  Private (Author, Admin)
 */
exports.unpublishPost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return sendResponse(res, 404, false, 'Post not found');
  }

  // Admin can unpublish any post, author can unpublish their own
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'User not authorized to unpublish this post');
  }

  post.status = 'draft';
  await post.save();

  sendResponse(res, 200, true, 'Post unpublished successfully', post);
});
