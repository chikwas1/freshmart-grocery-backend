const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().hex().length(24).required()
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().optional(),
  price: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().hex().length(24).optional()
});

module.exports = { productSchema, updateProductSchema };
