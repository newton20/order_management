var Order = require('../models/order');
var OrderMapper = require('../services/orderMappingService');
var rest = require('restler'); 

module.exports = function (app) {
  //
  // POST: /api/v1/orders
  // create a new order
  app.post('/api/v1/orders', function (req, res) {
    
    var requestBody = req.body;
    requestBody.updatedTime = Date.now();
    
    Order.create(requestBody, function (err, order) {
      if (err) {
        return res.send(err);
      }

      res.setHeader('Cache-Control', 'no-cache');
      return res.json(order);
    });
  });

  //
  // GET: /api/v1/order/:id
  // get an order by id
  app.get('/api/v1/order/:id', function (req, res) {
    var id = req.params.id;
    Order.findById(id, function (err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      res.setHeader('Cache-Control', 'no-cache');
      return res.json(order);
    });
  });

  //
  // PUT: /api/v1/order/:id
  // update order status by id
  app.put('/api/v1/order/:id', function (req, res) {
    var id = req.params.id;
    Order.findById(id, function (err, order) {
      if (err) {
        return res.status(404).send(err);
      }

      // expected request body:
      // {
      //   status: 'SHIPPED'
      // }
      order.status = req.body.status;
      order.save(function (err) {
        if (err) {
          return res.status(404).send(err);
        }

        res.setHeader('Cache-Control', 'no-cache');
        return res.json(order);
      });
    });
  });
  
  // 
  // GET: /api/v1/order/:id/release
  // release an order to MCP platform, defined by order id
  app.get('/api/v1/order/:id/release', function (req, res) {
    var id = req.params.id;
    Order.findById(id, function (err, order) {
      if (err) {
        return res.status(404).send(err);
      }
      
      if (!order || !order._id) {
        return res.status(204).send('Order not found with id ' + id);
      }
      
      // map merchant order to platform order
      var platformOrder = OrderMapper.mapMerchantOrderToPlatformOrder(order);
      
      // send platform order to mcp platform 
      rest.post('https://int-merchantorder.commerce.cimpress.io/v1/orders', {
        username: 'mow-china',
        password: 'Spap4uPhUpHe',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        data: platformOrder
      }).on('success', function (savedOrder, response) {
        
        // on success, update merchant order with identifiers returned from platform
        order.mcpId = savedOrder.orderId;
        for (var item in order.items) {
          var savedItem = savedOrder.items.find(function (orderItem) {
            return orderItem.merchantItemId === item._id;
          });
          item.mcpId = savedItem.itemId;
        }
        
        order.save(function (err) {
          if (err) {
            return res.status(500).send(err);
          }
          
          res.setHeader('Cache-Control', 'no-cache');
          return res.json(order);
        });
      }).on('fail', function (data, response) {
        // if platform returned a fail signal, bubble failure to client with returned data
        return res.status(400).send(data);
      }).on('error', function (err, response) {
        // if unexpected happens, bubble exception to client with error information
        return res.status(500).send(err);
      });
    });
  });
};
