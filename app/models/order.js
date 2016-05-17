var mongoose = require('mongoose');
var orderItemSchema = require('./orderItem');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
  items: [
    orderItemSchema,
  ],
  shopper: {
    id: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
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
