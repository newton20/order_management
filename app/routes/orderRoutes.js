var Order = require('../models/order');
var statusMap = require('../models/statusMap');
var OrderService = require('../services/orderService');
var ProductService = require('../services/productService');
var SMS_Mail = require('../services/SMS&MailService');
var ShortLink = require('../services/ShortLinkService');
var rest = require('restler');
var underscore = require('underscore');
var mailConfig = require('../../config/mailConfig');
var async = require('async');
var serverConfig = require('../../config/server');
var stringHelper = require('../utility/stringHelper');

module.exports = function(app) {
  //
  // POST: /api/v1/orders
  // create a new order
  app.post('/api/v1/orders', function(req, res) {

    var requestBody = req.body,
      markerplaceCode = requestBody.markerplaceCode,
      partnerId = "";
    requestBody.updatedTime = Date.now();
    delete requestBody["_id"];

    // send platform order to mcp platform
    async.eachSeries(requestBody.items, function(item, callback) {
      delete item["_id"];
      ProductService.getProductByMarketplaceId(markerplaceCode, item.product.id, function (productInfo) {
        if (productInfo) {
          item.product.mcpSku = productInfo.mcpSKU;
          item.product.name = productInfo.name;
          item.product.description = productInfo.description;
          if (partnerId.length === 0) {
            partnerId = productInfo.partner.id;
          }
        }
        callback();
      })
    }, function () {
      requestBody.partnerId = partnerId;

      Order.create(requestBody, function (err, order) {
        if (err) {
          return res.send(err);
        }

        ShortLink.getShortLink(stringHelper.stringformat(serverConfig.OnlineSolutionEntryPoint, [order.partnerId, order._id]), function (shortLink) {
          if (order.shopper.phone && order.shopper.phone.length >= 11) {
            SMS_Mail.sendSMS(order.shopper.phone, "7472", [order.shopper.familyName + " " + order.shopper.firstName, order.partnerId, shortLink]);
          }
          if (order.shopper.email) {
            SMS_Mail.sendEmail(mailConfig.newOrder, [order.shopper.familyName + " " + order.shopper.firstName, order.partnerId, shortLink], order.shopper.email);
          }
        });

        res.setHeader('Cache-Control', 'no-cache');
        return res.json(order);
      });
    });
  });

  //
  // POST: /api/v1/order/:order_id/item/:item_id/documents
  // create a doc for an order item
  app.post('/api/v1/order/:order_id/item/:item_id/documents', function(req, res) {

    var orderid = req.params.order_id;
    var itemid = req.params.item_id;
    
    Order.findById(orderid, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }
      underscore.each(order.items, function(item) {
        if (item._id.toString() === itemid) {
          item.document = {
        'documentId': req.body.documentId,
        'instructionSourceEndpointUrl': req.body.instructionSourceEndpointUrl,
        "instructionSourceVersion": req.body.instructionSourceVersion
        };
        }
       });      

      order.save(function(err) {
        if (err) {
          return res.status(404).send(err);
        }

        res.setHeader('Cache-Control', 'no-cache');
        return res.json(order);
      });
    });
  });

  //
  // POST: /api/v1/events
  // receive event callbacks from mcp for status changes.
  app.post('/api/v1/events', function(req, res) {
    var eventId = req.body.eventId;
    var eventType = req.body.eventType;
    var orderReferenceId = req.body.merchantOrderId;
    var newItemStatus = statusMap[eventType];

    // check if the mcp event maps to a merchant status change
    if (!newItemStatus) {
      return res.status(204).send('no content');
    }

    var itemsWithNewStatus = req.body[eventType + 'Details'];

    if (!itemsWithNewStatus || itemsWithNewStatus.length === 0) {
      return res.status(204).send('no content');
    }

    Order.findOne({'orderReferenceId':orderReferenceId}, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      if (!order || !order._id) {
        return res.status(204).send('Order not found with id ' + id);
      }
      
      var updatedOrder = order
      underscore.each(itemsWithNewStatus, function(item) {
        var itemId = item.merchantItemId;
    
        if (!itemId) {
          return;
        }
        
        // update order status
        OrderService.updateItemStatus(updatedOrder, itemId, newItemStatus, function(err, orderCallback) {
          if(err){
            return res.status(500).send(err);
          }
          
          updatedOrder = orderCallback;
        });
        
        updatedOrder.save(function(err, savedOrder) {
          if (err) {
            return res.status(500).send(err);
          }
          if(updatedOrder.status === "SHIPPED")
          {
            if(updatedOrder.shopper.phone && updatedOrder.shopper.phone.length >= 11)
            {
              SMS_Mail.sendSMS(updatedOrder.shopper.phone,"15028",[updatedOrder.shopper.familyName + " " + order.shopper.firstName,updatedOrder.shippingOption.id]);
            }
            if (order.shopper.email) {
              SMS_Mail.sendEmail(mailConfig.orderShipped, [order.shopper.familyName + " " + order.shopper.firstName, updatedOrder.shippingOption.id], order.shopper.email);
            }
          }
          res.setHeader('Cache-Control', 'no-cache');
          return res.json(savedOrder);
        });
      });
    });
  });

  //
  // PUT: /api/v1/order/:id
  // update order status by id
  app.put('/api/v1/order/:id', function(req, res) {
    var id = req.params.id;
    // expected request body:
    // {
    //   status: 'SHIPPED'
    // }
    var newStatus = req.body.status;
    OrderService.updateOrderStatus(id, newStatus, function(err, updatedOrder) {
      if (err) {
        return res.status(404).send(err);
      }
      return res.json(updatedOrder);
    });
  });

  //
  // PUT: /api/v1/order/:order_id/item/:item_id
  // update order item status by order id and item id
  app.put('/api/v1/order/:order_id/item/:item_id', function(req, res) {
    var orderid = req.params.order_id;
    var itemid = req.params.item_id;

    // expected request body:
    // {
    //   status: 'SHIPPED'
    // }
    var newStatus = req.body.status;
     Order.findById(orderid, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }
      var updatedOrder = order;
      OrderService.updateItemStatus(updatedOrder, itemid, newStatus, function(err, orderCallback) {
      if (err) {
        return res.status(404).send(err);
      }
      updatedOrder = orderCallback;
    });
    updatedOrder.save(function(err, savedOrder) {
          if (err) {
            return res.status(500).send(err);
          }
          
          res.setHeader('Cache-Control', 'no-cache');
          return res.json(savedOrder);
        });
   });
  });

  //
  // GET: /api/v1/order/:id
  // get an order by id
  app.get('/api/v1/order/:id', function(req, res) {
    var id = req.params.id;
    Order.findById(id, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      res.setHeader('Cache-Control', 'no-cache');
      return res.json(order);
    });
  });
  
  //
  // GET: /api/v1/orderReference/:orderReferenceId
  // get an order by orderReferenceId
  app.get('/api/v1/orderReference/:orderReferenceId', function(req, res) {
    var orderReferenceId = req.params.orderReferenceId;
    Order.findOne({'orderReferenceId':orderReferenceId}, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      res.setHeader('Cache-Control', 'no-cache');
      return res.json(order);
    });
  });

  //
  // GET: /api/v1/order/:order_id/items/status/:status
  // get items in an order that match provided status
  app.get('/api/v1/order/:order_id/items/status/:status', function(req, res) {
    var orderId = req.params.order_id;
    var itemStatus = req.params.status;

    Order.findById(orderId, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      var matchedItems = underscore.filter(order.items, function(item) {
        return item.status.toLowerCase() === itemStatus.toLowerCase();
      });

      res.setHeader('Cache-Control', 'no-cache');
      return res.json(matchedItems);
    });
  });

  //
  // GET: /api/v1/order/:id/release
  // release an order to MCP platform, defined by order id
  app.get('/api/v1/order/:id/release', function(req, res) {
    var id = req.params.id;
    Order.findById(id, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      if (!order || !order._id) {
        return res.status(204).send('Order not found with id ' + id);
      }

      // map merchant order to platform order
      var platformOrder = OrderService.mapMerchantOrderToPlatformOrder(order);

      // send platform order to mcp platform
      rest.post(serverConfig.MCPOrderService, {
        username: 'mow-china',
        password: 'Spap4uPhUpHe',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        data: JSON.stringify(platformOrder)
      }).on('success', function(savedOrder, response) {

        // on success, update merchant order with identifiers returned from platform
        order.mcpId = savedOrder.orderId;
        
        ShortLink.getShortLink(stringHelper.stringformat(serverConfig.OnlineSolutionEntryPoint, [order.partnerId, order._id]), function (shortLink) {
          if (order.shopper.phone && order.shopper.phone.length >= 11) {
            SMS_Mail.sendSMS(order.shopper.phone, "15027", [order.shopper.familyName + " " + order.shopper.firstName, shortLink]);
          }
          
          if (order.shopper.email) {
            SMS_Mail.sendEmail(mailConfig.orderPalced, [order.shopper.familyName + " " + order.shopper.firstName, shortLink], order.shopper.email);
          }
        });
        // iterate through items returned from MCP platform to get mcp item id
        // update items in merchant order with retrieved mcp item id
        underscore.each(order.items, function (item) {
          var savedItem = underscore.find(savedOrder.fulfillmentGroups[0].items, function (mcpItem) {
            return mcpItem.merchantItemId === item.itemReferenceId;
          });

          if (savedItem) {
            item.mcpId = savedItem.itemId;
          }
        });

        order.save(function(err) {
          if (err) {
            return res.status(500).send(err);
          }

          res.setHeader('Cache-Control', 'no-cache');
          return res.json(order);
        });
      }).on('fail', function(data, response) {
        // if platform returned a fail signal, bubble failure to client with returned data
        return res.status(response.statusCode).send(data);
      }).on('error', function(err, response) {
        // if unexpected happens, bubble exception to client with error information
        return res.status(500).send(err);
      });
    });
  });
};
