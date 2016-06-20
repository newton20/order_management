var rest = require('restler');

var getProductByMarketplaceId = function (marketplaceId) {
    rest.get('http://139.224.29.98:10200/api/v1/products/marketplaceId/' + marketplaceId, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).on('success', function (product, response) {
        return product;
    });
};

module.exports = {
    getProductByMarketplaceId: getProductByMarketplaceId
};