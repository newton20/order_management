var statusMap = {
  platformAccepted: 'RELEASED_TO_PLATFORM',
  productionAccepted: 'IN_PRODUCTION',
  fulfillment: 'SHIPPED',
  fulfillerRejected: 'PLATFORM_CANCELLED',
  platformCancellation: 'PLATFORM_CANCELLED',
  cancellationResponse: 'MERCHANT_CANCELLED'
};

module.exports = statusMap;
