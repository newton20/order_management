var statuses = [
    'NEW',                   // an order/item is newly added to merchant system
    'WAITING_USER_DESIGN',   // an order/item that is waiting on user design
    'RELEASE_PENDING',       // user finished design but waiting on package delivery
    'RELEASED',              // package received, released to mcp platform
    'PLATFORM_REJECTED',     // order/item rejected by mcp platform
    'SHIPPED',               // mcp platform shipped the order/item to customer
    'CANCELLED',             // order/item has been cancelled
    'COMPLETED'              // order/item completed
];

module.exports = statuses;