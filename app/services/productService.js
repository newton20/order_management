var rest = require('restler');
var stringHelper = require('../utility/stringHelper');
var config = require('config');

var APIConfig = config.get('Order.APIConfig');

var getProductByMarketplaceId = function (marketplace_Code, marketplace_id, callback) {
    var marketplaceId = marketplace_id,
        marketplaceCode = marketplace_Code;
    rest.get(stringHelper.stringformat(APIConfig.ProductService ,[marketplaceCode, marketplaceId]), {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).on('success', function (product, response) {
        callback(product);
    });
};

module.exports = {
    getProductByMarketplaceId: getProductByMarketplaceId
};