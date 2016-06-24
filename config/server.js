module.exports = {
  domain: 'localhost',
  port: '10100',
  SMSService: 'http://139.224.68.25:2333/SMSService.svc/SMS/Send',
  MailService: 'http://139.224.68.25:2333/MailService.svc/Mail/Send',
  ShortLinkService: 'http://139.224.68.25:6666/ShortLink.svc/?url_long={0}',
  ProductService: 'http://139.224.29.98:10200/api/v1/products/marketplaceCode/{0}/marketplaceId/{1}',
  OnlineSolutionEntryPoint: 'http://139.224.68.25/Home/Index/{0}_{1}',
  MCPOrderService: 'https://int-merchantorder.commerce.cimpress.io/v1/orders'
};
