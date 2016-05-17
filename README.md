RESTful APIs for order management
==========================

* Take an order from upstream and store it to database
* Update order status when MCP emits an order update event
* Get an order by order id
* Get orders by shopper key
* Trigger notification when needed (to be defined...)

System Requirements:

- Need to npm install all packages from package.json
- Installation of MongoDB
-- See \config\db.js for assumed DB configurations
- See config\server.js for assumed server configurations
- Run the server using "nodemon" from the installed npm package. OR run "npm start"
-- E.g. "./node_modules/nodemon/bin/nodemon.js"
- View Swagger UI at /swagger
