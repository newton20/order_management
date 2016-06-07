var rest = require('restler');

var getShortLink = function (longLink) {
    console.log("SMS");
    rest.get('http://localhost:6666/ShortLink.svc/?url_long='+longLink, {
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
      }).on('success', function(result, response) {
          // remove http://t.cn/
          return result.url_short.substr(12);
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