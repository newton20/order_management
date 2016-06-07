var rest = require('restler');

var sendSMS = function (receiver,tmplateId,content) {
    console.log("SMS");
    var criteria = {
        receiver: "[\""+receiver+"\"]",
        template:tmplateId,
        content:JSON.stringify(content)
    };
    rest.post('http://localhost:8080/SMSService.svc/SMS/Send', {
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        data: JSON.stringify(criteria)
      }).on('success', function(result, response) {
          console.log("SMS Sent");
      }).on('fail', function(data, response) {
        // if platform returned a fail signal, bubble failure to client with returned data
        console.log("SMS fail");
        
      }).on('error', function(err, response) {
        // if unexpected happens, bubble exception to client with error information
        console.log("SMS error");
      });
};
module.exports = {
    sendSMS : sendSMS
}