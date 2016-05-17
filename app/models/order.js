var mongoose = require('mongoose');
var orderItemModule = require('./order_item');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
  id: { type: String, required: true },
  items: [
    orderItemModule.OrderItemSchema,
  ],
  shippingAddress: {
    name: { type: String },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    province: { type: String },
    zipcode: { type: String },
  },
  shippingOption: {
    id: { type: String },
    name: { type: String },
    description: { type: String },
  },
  status: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date },
});

module.exports = mongoose.model('Order', orderSchema);
