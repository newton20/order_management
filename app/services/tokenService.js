var rest = require('restler');
var stringHelper = require('../utility/stringHelper');
var config = require('config');

var APIConfig = {};

if (config.has('Order.APIConfig')) {
  APIConfig = config.get('Order.APIConfig');
}

var getToken = function () {
    rest.get(APIConfig.tokenService, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).on('success', function (token, response) {
        return token.Id_token;
    });
};

module.exports = {
    getToken: getToken
};