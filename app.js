// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
// var router = require('./routes/api');
var path = require('path');

mongoose.connect('mongodb://localhost:27017/demo', (e) => {
  if (e) return console.log(e);
  console.log("Mongo connected");
});


var index = require('./routes/index');
var users = require('./routes/users');
var nodes = require('./routes/nodes');
var roots = require('./routes/roots');
var sensors = require('./routes/sensors');
var data = require('./routes/data');
var locations = require('./routes/locations');
var jwt = require('jsonwebtoken');
var config = require('../config/token');
app.set('superSecret', config.secret);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');1

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
app.use('/', index);
app.use('/users', users);

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Request timeout
app.use(function (req, res, next) {
  res.setTimeout(120000, function () {
    console.log('Request has timed out.');
    res.send(408);
  });

  next();
});

app.use((req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).json({
      success: false,
      message: 'No token provided.'
    });

  }
});

app.use('/roots', roots);
app.use('/nodes', nodes);
app.use('/sensors', sensors);
app.use('/data', data);
app.use('/locations', locations);
app.get('*', (req, res) => {
  // res.json({message : "wassup"});
   return res.status(404).json({
      success: false,
      message: 'What???'
    });
})
var port = process.env.PORT || 8080;        // set our port

// app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port' + port);