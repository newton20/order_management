var rest = require('restler');
var serverConfig = require('../../config/server');
var stringHelper = require('../utility/stringHelper');

var getProductByMarketplaceId = function (marketplaceCode, marketplace_id, callback) {
    var marketplaceId = marketplace_id;
    rest.get(stringHelper.stringformat(serverConfig.ProductService ,marketplaceCode, marketplaceId), {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).on('success', function (product, response) {
        callback(product);
    });
};

module.exports = {
    getProductByMarketplaceId: getProductByMarketplaceId
};