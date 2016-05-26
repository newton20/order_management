var statuses = {
  'NEW': 0,                    // an order/item is newly added to merchant system
  'DESIGN_FINISHED': 10,       // user has finished designed for an order/item
  'RELEASED_TO_PLATFORM': 11,  // an order has been released to mcp platform
  'IN_PRODUCTION': 20,         // an order/item is in production by mcp platform
  'PLATFORM_REJECTED': 21,     // an order/item rejected by mcp platform
  'SHIPPED': 30,               // an order/item has been produced and shipped to client
  'USER_CANCELLED': 31,        // an order/item has been cancelled by user
  'MERCHANT_CANCELLED': 32,    // an order/item has been cancelled by merchant
  'PLATFORM_CANCELLED': 33    // an order/item has been cancelled by mcp platform
};

module.exports = statuses;
