// routes/blogRoutes.js
import express from 'express';
import {
  saveDraft,
  publishBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  getDrafts,
  getPublishedBlogs,
  updateBlogStatus,
  getBlogsByTag,
  getAllTags,
  getUserBlogs,
  updateBlog
} from '../Controllers/Blog.controller.js';
import { protect } from '../Middlewares/auth.middleware.js';

const router = express.Router();

// ==== Protected Routes (require authentication) ====
// Save or update a draft
router.post('/save-draft', protect, saveDraft);

// Publish a blog (new or from draft)
router.post('/publish', protect, publishBlog);

//Update a Blog
router.patch('/:id', protect,updateBlog );

// Get all drafts for the logged-in user
router.get('/drafts', protect, getDrafts);

// Get all blogs (both drafts and published) for the logged-in user
router.get('/my-blogs', protect, getUserBlogs);

// Update blog status (draft to published or vice versa)
router.patch('/status/:id', protect, updateBlogStatus);

// Delete a blog
router.delete('/:id', protect, deleteBlog);

// ==== Public Routes (no authentication required) ====
// Get all published blogs
router.get('/published', getPublishedBlogs);

// Get a specific blog by ID
router.get('/id/:id',protect, getBlogById);

// Get blogs by tag
router.get('/tags/:tag', getBlogsByTag);

// Get all unique tags
router.get('/tags', getAllTags);

// Get all blogs (admin route, could be protected with admin middleware)
router.get('/', getAllBlogs);

export default router;