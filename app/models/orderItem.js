var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderItemSchema = new Schema({
  product: {
    id: { type: String, required: true },
    mcpSku: { type: String, required: true },
    name: { type: String },
    description: { type: String },
  },
  document: {
    id: { type: String },
  },
  amount: {
    currency: { type: String },
    itemAmount: { type: Number },
    shippingAmount: { type: Number },
    taxAmount: { type: Number },
    totalAmount: { type: Number },
  },
  status: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date },
});

// module.exports = mongoose.model('OrderItem', orderItemSchema);
module.exports = orderItemSchema;