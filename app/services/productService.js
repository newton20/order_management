var rest = require('restler');
var serverConfig = require('../../config/server');
var stringHelper = require('../utility/stringHelper');

var getProductByMarketplaceId = function (marketplace_Code, marketplace_id, callback) {
    var marketplaceId = marketplace_id,
        marketplaceCode = marketplace_Code;
    rest.get(stringHelper.stringformat(serverConfig.ProductService ,[marketplaceCode, marketplaceId]), {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).on('success', function (product, response) {
        callback(product);
    });
};

module.exports = {
    getProductByMarketplaceId: getProductByMarketplaceId
};