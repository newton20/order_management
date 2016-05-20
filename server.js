// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');
var fs             = require('fs');
var argv           = require('minimist')(process.argv.slice(2));
var swagger        = require('swagger-node-express');

// configuration ===========================================

// config files
var db = require('./config/db');
var serverConfig = require('./config/server');

// set our port
var port = process.env.PORT || serverConfig.port;

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// set the static files location
app.use(express.static(__dirname + '/public'));

// expose the bower components for easy references
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// set up swagger ui
// reference: https://github.com/shawngong/Swagger-Node-Express-For-Existing-APIs
app.use('/swagger', express.static('./swagger/dist'));
swagger.setAppHandler(app);
swagger.configureSwaggerPaths('', 'api-docs', '');
swagger.configure('http://localhost:6999', '1.0.0');

swagger.setApiInfo({
  title: 'NodeJs API boiler plate',
  description: 'RESTful API boiler plate in NodeJs',
  contact: 'xlei@cimpress.com',
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/swagger/dist/index.html');
});

// models ==================================================
// var modelsPath = __dirname + '/app/models';
// var modelsFiles = fs.readdirSync(modelsPath);
// modelsFiles.forEach(function (file) {
//   require(modelsPath + '/' + file)
// });

// routes ==================================================
var routesPath = __dirname + '/app/routes';
var routesFiles = fs.readdirSync(routesPath);
routesFiles.forEach(function (file) {
  require(routesPath + '/' + file)(app);
});

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Order management service is listening on port ' + port);

// expose app
exports = module.exports = app;
