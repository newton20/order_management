// Mapping service for order so that data can be passed to MCP Commerce
// Potential use: https://github.com/wankdanker/node-object-mapper
var underscore = require('underscore');

var mapMerchantOrderToPlatformOrder = function (merchantOrder) {
    
    // Map each item into platform required format
    var items = [];
    underscore.each(merchantOrder.items, function (item) {
        var platformItem = {
            'merchantItemId': item._id,
            'skuCode': item.product.mcpSku,
            'quantity': item.quantity,
            'merchantProductName': item.product.name,
            'documentReference': item.document.id
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
        'merchantOrderId': merchantOrder._id,
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

// Helper function for address mapping
var mapMerchantOrderAddressToPlatformAddress = function (merchantAddress) {
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

module.exports = {
    mapMerchantOrderToPlatformOrder: mapMerchantOrderToPlatformOrder
};