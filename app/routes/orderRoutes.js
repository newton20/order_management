var Order = require('../models/order');

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
};
