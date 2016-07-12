var rest = require('restler');
var serverConfig = require('../../config/server');
var stringHelper = require('../utility/stringHelper');

var getShortLink = function (longLink, callback) {
    rest.get(stringHelper.stringformat(serverConfig.ShortLinkService, [longLink]), {
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
      }).on('success', function(result, response) {
          // remove http://t.cn/
          callback(result.url_short.substr(12));
      }).on('fail', function(data, response) {
        // if platform returned a fail signal, bubble failure to client with returned data
        console.log(data);
      }).on('error', function(err, response) {
        // if unexpected happens, bubble exception to client with error information
        console.log(data);
      });
};
module.exports = {
    getShortLink : getShortLink
}