const express = require('express')
const router = express.Router();
const { getAllBlogs, getBlog, postBlog, deleteBlog, updateBlog } = require('../controllers/blog.controller');

// CRUD ON BLOG
router
.get('/', getAllBlogs)
.post('/', postBlog);

router
.get('/:id', getBlog)
.patch('/:id', updateBlog)
.delete('/:id', deleteBlog);


module.exports = router;
