const Blog = require("../models/blog.model");
const { isValidObjectID } = require('../utils/helperFunctions');
const { SUCCESS, FAIL, ERROR } = require('../utils/HTTPStatus');

const getAllBlogs = async (req, res) => {
  try {
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const blogList = await Blog.find({}, {"__v": false}).limit(limit).skip(skip);
    if (blogList.length === 0) {
        return res.status(200).json({
        status: SUCCESS,
        message: "No blogs were added yet",
      });
    }
    res.status(200).json({
      status: SUCCESS,
      data: blogList
    }
    );
  } catch (err) {
    res.status(500).json({
      status: ERROR,
      error: err,
    });
  }
};

const getBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectID(id)) {
      return res.status(400).json({
      status: FAIL,
      err: "Invalid ObjectID was given"
    });
    }
    const blog = await Blog.findById(id);
    if (blog) {
      res.status(200).json({
        status: SUCCESS,
        blog,
      });
    } else {
      res.status(404).json({
        status: FAIL,
        message: "Blog wasn't found",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: ERROR,
      error: err,
    });
  }
};

const postBlog = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      status: ERROR,
      error: err,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    await Blog.deleteOne({_id: req.params.id});
    res.status(204).json({
      status: SUCCESS,
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: ERROR,
      error: err,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blogID = req.params.id;
    const updatedBlog = await Blog.updateOne({_id: blogID}, {$set: {...req.body}});
    if (updatedBlog['acknowledged']){
      return res.status(200).json({
        status: SUCCESS,
        message: "Blog was updated"
      });
    } else {
      return res.status(400).json({
        status: FAIL,
        message: "This blog wasn't updated"
      });
    }
  } catch(err){
      console.log(err);
      return res.status(500).json({
      status: ERROR,
      error: err,
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlog,
  postBlog,
  deleteBlog,
  updateBlog
};
