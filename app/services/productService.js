var rest = require('restler');
var serverConfig = require('../../config/server');

var getProductByMarketplaceId = function (marketplace_id, callback) {
    var marketplaceId = marketplace_id;
    rest.get(serverConfig.ProductService + marketplaceId, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).on('success', function (product, response) {
        callback(product);
    });
};

module.exports = {
    getProductByMarketplaceId: getProductByMarketplaceId
};