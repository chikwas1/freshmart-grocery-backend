const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

exports.createProduct = async (req, res) => {
  const categoryExists = await Category.findById(req.body.category);
  if (!categoryExists) return ApiResponse.error(res, 'Referenced category does not exist', 404);

  const product = await Product.create(req.body);
  ApiResponse.success(res, 'Product created successfully', product, 201);
};

exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .populate('category', 'name')
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments();

  ApiResponse.success(res, 'Products fetched successfully', {
    products,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) return ApiResponse.error(res, 'Product not found', 404);
  ApiResponse.success(res, 'Product details fetched', product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return ApiResponse.error(res, 'Product not found', 404);
  ApiResponse.success(res, 'Product updated successfully', product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return ApiResponse.error(res, 'Product not found', 404);
  ApiResponse.success(res, 'Product deleted successfully');
};

// Helper snippet for bounded pagination
const getPaginationParams = (query) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 10; // Max 100 per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Usage inside a controller:
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const products = await Product.find().skip(skip).limit(limit);
    const total = await Product.countDocuments();

    return res.status(200).json({
      success: true,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};
