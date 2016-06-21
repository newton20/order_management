var rest = require('restler');
var serverConfig = require('../../config/server');

var sendSMS = function (receiver,tmplateId,content) {
    var criteria = {
        receiver: "[\""+receiver+"\"]",
        template:tmplateId,
        content:JSON.stringify(content)
    };
    rest.post(serverConfig.SMSService, {
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

var sendEmail = function(mailConfig, content, mailTo)
{
    var criteria = {
        mailResourceKey: mailConfig.resourceKey,
        subject:mailConfig.subject,
        mailBody:Stringformat(mailConfig.body,content),
        mailTo:mailTo
    };
        rest.post(serverConfig.MailService, {
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        data: JSON.stringify(criteria)
      }).on('success', function(result, response) {
          console.log("Email Sent");
      }).on('fail', function(data, response) {
        // if platform returned a fail signal, bubble failure to client with returned data
        console.log("Email fail");
        
      }).on('error', function(err, response) {
        // if unexpected happens, bubble exception to client with error information
        console.log("Email error");
      });
}

var Stringformat = function(format, arguments) {
    if( arguments.length == 0 )
        return null;
    for(var i=0;i<arguments.length;i++) {
        var re = new RegExp('\\{' + (i) + '\\}','gm');
        format = format.replace(re, arguments[i]);
    }
    return format;
}

module.exports = {
    sendSMS : sendSMS,
    sendEmail : sendEmail
}