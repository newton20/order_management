// Order service to encapsulate business logic related to orders
// Potential use: https://github.com/wankdanker/node-object-mapper
var underscore = require('underscore');
var statuses = require('../models/status');
var Order = require('../models/order');

//
// Map merchant order to mcp platform order contract
var mapMerchantOrderToPlatformOrder = function(merchantOrder) {

  // Map each item into platform required format
  var items = [];
  underscore.each(merchantOrder.items, function(item) {
    var platformItem = {
      'merchantItemId': item.itemReferenceId,
      'skuCode': item.product.mcpSku,
      'quantity': item.quantity,
      'merchantProductName': item.product.name,
      'documentReference': {
        'documentId': item.document.documentId,
        'instructionSourceEndpointUrl':'http://originwww.vistaprint.prod/documents/api/rendering/',
        'instructionSourceVersion':'1.1'
      },
      'customsInformation': {
        'listPrice': {
          'basePrice':item.amount.totalAmount,
          'shippingPrice':0.00,
          'currencyCode':'CNY'},
        'pricePaid': {
          'basePrice':item.amount.totalAmount,
          'shippingPrice':0.00,
          'currencyCode':'CNY'}
      }
    };
    items.push(platformItem);
  });

  // Map shipping address
  var platformAddress = mapMerchantOrderAddressToPlatformAddress(merchantOrder.shippingAddress);

  // Map fulfillment group
  // One fulfillment per order for now
  var fulfillmentGroups = [{
    'items': items,
    'destinationAddress': platformAddress,
    'promisedArrivalDate': merchantOrder.createdTime
  }];

  // Map order
  var platformOrder = {
    'merchantOrderId': merchantOrder.orderReferenceId,
    'merchantCustomerId': merchantOrder.shopper.key,
    'merchantPlacedDate': merchantOrder.createdTime,
    'merchantId': 'mow-china',
    'merchantSalesChannel': 'online-solution',
    'merchantOrderSupportContact': {
      'email': 'CimpressChinaTechnology@cimpress.com'
    },
    'fulfillmentGroups': fulfillmentGroups
  };

  return platformOrder;
};

//
// Update order status
// orderStatusCallback accepts two parameters: error and updated order object
var updateOrderStatus = function(orderid, newStatus, orderStatusCallback) {
  // If new status is not valid, return error to caller
  if (!underscore.contains(underscore.keys(statuses), newStatus)) {
    orderStatusCallback('Invalid status: ' + newStatus, null);
    return;
  }
  Order.findById(orderid, function(err, order){
    order.status = newStatus;
    var orderStatusValue = statuses[newStatus];
    underscore.each(order.items, function(item) {
      var itemStatusValue = statuses[item.status];

      // If item in a status has higher value, do nothing
      if (itemStatusValue > orderStatusValue) {
        return;
      }
      // Else, update item status to the same as order status
      item.status = newStatus;
      });
    
    order.save(function(err) {
      if (err) {
        itemStatusCallback(err, null);
      }
    });
  });

  orderStatusCallback(null, order);
};

//
// Update item status
// itemStatusCallback accepts two parameters: error and updated order object
var updateItemStatus = function(order, itemId, newStatus, itemStatusCallback) {
  // If new status is not valid, return error to caller
  if (!underscore.contains(underscore.keys(statuses), newStatus)) {
    itemStatusCallback('Invalid status: ' + newStatus, null);
    return;
  }
  
  var targetItem = underscore.find(order.items, function(item) {
    return item._id.toString() === itemId;
  });
  
  targetItem.status = newStatus;

  // If all item statuses are at least at new status level
  // and order status is lagging behind, update order status accordingly
  var newStatusValue = statuses[newStatus];
  var allItemOnSameLevel = underscore.every(order.items, function(item) {
    var itemStatusValue = statuses[item.status];
    return itemStatusValue >= newStatusValue;
  });

  var orderStatusValue = statuses[order.status];
  if (allItemOnSameLevel && orderStatusValue < newStatusValue) {
    order.status = newStatus;
  }
  
  itemStatusCallback(null, order);
};

/*
*  HELPER FUNCTIONS BELOW
*/

var mapMerchantOrderAddressToPlatformAddress = function(merchantAddress) {
  return {
    'firstName': merchantAddress.firstName,
    'lastName': merchantAddress.familyName,
    'company': merchantAddress.company,
    'street1': merchantAddress.street1,
    'street2': merchantAddress.street2,
    'city': merchantAddress.city,
    'stateOrProvince': merchantAddress.region,
    'country': merchantAddress.country,
    'postalCode': merchantAddress.zipcode,
    'phone': merchantAddress.phone
  };
};

/*
*  HELPER FUNCTIONS ABOVE
*/

module.exports = {
  mapMerchantOrderToPlatformOrder: mapMerchantOrderToPlatformOrder,
  updateOrderStatus: updateOrderStatus,
  updateItemStatus: updateItemStatus
};
