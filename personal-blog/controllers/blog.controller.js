const Blog = require('../models/blog.model');
const { isValidObjectID } = require('../utils/helperFunctions');
const { SUCCESS, FAIL } = require('../utils/HTTPStatus');
const asyncWrapper = require('../middlewares/asyncWrapper');
const CustomError = require('../utils/customError');


const getAllBlogs = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const blogList = await Blog.find({}, { __v: false }).limit(limit).skip(skip);

  if (blogList.length === 0) {
    return res.status(200).json({
      status: SUCCESS,
      message: 'No blogs were added yet',
    });
  }

  res.status(200).json({
    status: SUCCESS,
    data: blogList,
  });
});

const getBlog = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  if (!isValidObjectID(id)) {
    const err = new CustomError(400, "Invalid ObjectID was given", FAIL);
    return next(err);
  }
  const blog = await Blog.findById(id);
  if (blog) {
    return res.status(200).json({
      status: SUCCESS,
      blog,
    });
  }
  const err = new CustomError(404, "Blog wasn't found", FAIL);
  return next(err);
});

const postBlog = asyncWrapper(async (req, res, next) => {
  let blog = new Blog({
    content: req.body.content,
    timestamp: Date.now(),
  });
  blog = await blog.save();
  const blogObject = blog.toObject();
  delete blogObject.__v;
  res.status(201).json({
    status: SUCCESS,
    blogObject,
  });
});

const deleteBlog = asyncWrapper(async (req, res, next) => {
  await Blog.deleteOne({ _id: req.params.id });
  res.status(204).json({
    status: SUCCESS,
    data: null,
  });
});

const updateBlog = asyncWrapper(async (req, res, next) => {
  const blogID = req.params.id;
  const updatedBlog = await Blog.updateOne(
    { _id: blogID },
    { $set: { ...req.body } },
  );
  if (updatedBlog['acknowledged']) {
    return res.status(200).json({
      status: SUCCESS,
      message: 'Blog was updated',
    });
  }
  const err = new CustomError(400, "This blog wasn't updated", FAIL);
  return next(err);
});

module.exports = {
  getAllBlogs,
  getBlog,
  postBlog,
  deleteBlog,
  updateBlog,
};
