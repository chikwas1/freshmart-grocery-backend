const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

exports.createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  ApiResponse.success(res, 'Category created successfully', category, 201);
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find();
  ApiResponse.success(res, 'Categories retrieved', categories);
};

exports.getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return ApiResponse.error(res, 'Category not found', 404);
  ApiResponse.success(res, 'Category retrieved', category);
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return ApiResponse.error(res, 'Category not found', 404);
  ApiResponse.success(res, 'Category updated successfully', category);
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return ApiResponse.error(res, 'Category not found', 404);
  ApiResponse.success(res, 'Category deleted successfully');
};
