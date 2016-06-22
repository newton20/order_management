module.exports = {
  domain: 'localhost',
  port: '10100',
  SMSService: 'http://139.224.68.25:2333/SMSService.svc/SMS/Send',
  MailService: 'http://139.224.68.25:2333/MailService.svc/Mail/Send',
  ShortLinkService: 'http://139.224.68.25:6666/ShortLink.svc/?url_long=',
  ProductService: 'http://139.224.29.98:10200/api/v1/products/marketplaceId/',
  OnlineSolutionEntryPoint: 'http://139.224.68.25/Home/Index/',
  MCPOrderService: 'https://int-merchantorder.commerce.cimpress.io/v1/orders'
};
