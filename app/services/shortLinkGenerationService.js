var rest = require('restler');
var config = require('../../config/server');
var Order = require('../models/order');

//
// Get a short link by order id
// Callback accepts two parameters: error and generated short link
var getShortLinkByOrderId = function (orderId, callback) {
    var endpoint = config.shortLinkServiceUrl + '/shortlink/order/' + orderId;
    rest.get(endpoint, {
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    }).on('success', function (data, response) {
        callback(null, data.link);
        return;
    }).on('error', function (err) {
        callback(err, null);
        return;
    }).on('fail', function (data, response) {
        callack(data, null);
        return;
    });
};

// 
// Get a short link by order reference id
// Callback accepts two parameters: error and generated short link
var getShortLinkByOrderReferenceId = function (orderReferenceId, callback) {
    Order.find({ 'orderReferenceId': orderReferenceId }, function (err, order) {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (!order) {
            callback({'Error': 'Order not found. Reference id: ' + orderReferenceId}, null);
            return;
        }
        
        getShortLinkByOrderId(order._id.toString(), callback);
    });
};

module.exports = {
    getShortLinkByOrderId: getShortLinkByOrderId,
    getShortLinkByOrderReferenceId : getShortLinkByOrderReferenceId
};
