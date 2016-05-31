var Order = require('../models/order');
var statusMap = require('../models/statusMap');
var OrderService = require('../services/orderService');
var rest = require('restler');
var underscore = require('underscore');

module.exports = function(app) {
  //
  // POST: /api/v1/orders
  // create a new order
  app.post('/api/v1/orders', function(req, res) {

    var requestBody = req.body;
    requestBody.updatedTime = Date.now();

    Order.create(requestBody, function(err, order) {
      if (err) {
        return res.send(err);
      }

      res.setHeader('Cache-Control', 'no-cache');
      return res.json(order);
    });
  });

  //
  // POST: /api/v1/order/:order_id/item/:item_id/documents
  // create a doc for an order item
  app.post('/api/v1/order/:order_id/item/:item_id/documents', function(req, res) {

    var orderid = req.params.order_id;
    var itemid = req.params.item_id;
    var docid = req.body.docId;
    
    Order.findOne({'orderReferenceId':orderid}, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      order.items.forEach(function(item) {
        if(item.itemReferenceId === itemid)
          {
          // { docId : '1231' }
          item.document = {"id":docid};
          }
      }, this);

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
    var orderId = req.body.orderId;
    var merchantOrderId = req.body.merchantOrderId;
    var newItemStatus = statusMap[eventType];

    // check if the mcp event maps to a merchant status change
    if (!newItemStatus) {
      return res.status(204).send('no content');
    }

    var itemsWithNewStatus = req.body[eventType + 'Details'];

    if (!itemsWithNewStatus || itemsWithNewStatus.length === 0) {
      return res.status(204).send('no content');
    }

    Order.findOne({'orderReferenceId':merchantOrderId}, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      if (!order || !order._id) {
        return res.status(204).send('Order not found with id ' + id);
      }

      var updatedOrder = order;
      underscore.each(itemsWithNewStatus, function(item) {
        var itemId = item.merchantItemId;
    
        if (!itemId) {
          return;
        }
        // update order status
        OrderService.updateItemStatus(order, itemId, newItemStatus, function(err, ordercallback) {
          if(err){
            return res.status(500).send(err);
          }
          updatedOrder = ordercallback;
        });
      });

      updatedOrder.save(function(err) {
        if (err) {
          return res.status(500).send(err);
        }
        res.setHeader("connection", "keep-alive");
        res.json(updatedOrder);
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

      OrderService.updateItemStatus(orderid, itemid, newStatus, function(err, updatedOrder) {
        if (err) {
        return res.status(404).send(err);
        }
          return res.json(updatedOrder);
      });
  });

  //
  // GET: /api/v1/order/:id
  // get an order by id
  app.get('/api/v1/order/:id', function(req, res) {
    var id = req.params.id;
    Order.findOne({'orderReferenceId':id}, function(err, order) {
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

    Order.findOne({'orderReferenceId':orderId}, function(err, order) {
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
    Order.findOne({'orderReferenceId':id}, function(err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      if (!order || !order._id) {
        return res.status(204).send('Order not found with id ' + id);
      }

      // map merchant order to platform order
      var platformOrder = OrderService.mapMerchantOrderToPlatformOrder(order);

      // send platform order to mcp platform
      rest.post('https://int-merchantorder.commerce.cimpress.io/v1/orders', {
        username: 'mow-china',
        password: 'Spap4uPhUpHe',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        data: JSON.stringify(platformOrder)
      }).on('success', function(savedOrder, response) {

        // on success, update merchant order with identifiers returned from platform
        console.log(savedOrder.orderId);
        order.mcpId = savedOrder.orderId;
        
        order.items.forEach(function(item) {
          var matchedItems = underscore.filter(savedOrder.items, function(mcpItem) {
            return mcpItem.merchantItemId === item.itemReferenceId;
          });
          item.mcpId = matchedItems.itemId;
        }, this);

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
