var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderItemSchema = new Schema({
  itemReferenceId: { type: String, required: true },
  mcpId: { type: String },
  quantity: { type: Number, required: true },
  product: {
    id: { type: String, required: true },
    mcpSku: { type: String },
    name: { type: String },
    description: { type: String },
  },
  document: {
    documentId: { type: String },
    instructionSourceEndpointUrl: { type: String },
    instructionSourceVersion: { type: String }
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

module.exports = orderItemSchema;
