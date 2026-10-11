const Joi = require('joi');

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().hex().length(24).required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').required()
});

module.exports = { orderSchema, updateOrderStatusSchema };
