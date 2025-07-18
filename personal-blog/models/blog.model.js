const { Schema, model } = require("mongoose");


const blogSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

const BlogModel = model("Blog", blogSchema);

module.exports = BlogModel;
