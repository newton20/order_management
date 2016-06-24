var rest = require('restler');
var serverConfig = require('../../config/server');
var stringHelper = require('../utility/stringHelper');

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
        mailBody:stringHelper.stringformat(mailConfig.body,content),
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

module.exports = {
    sendSMS : sendSMS,
    sendEmail : sendEmail
}