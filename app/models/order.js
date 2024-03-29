var mongoose = require('mongoose');
var orderItemSchema = require('./orderItem');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
  mcpId: { type: String },
  items: [
    orderItemSchema,
  ],
  shopper: {
    key: { type: String, index: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  shippingAddress: {
    firstName: { type: String },
    familyName: { type: String },
    company: { type: String },
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    region: { type: String },
    country: { type: String },
    zipcode: { type: String },
    phone: { type: String }
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
