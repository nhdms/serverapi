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

var index = require('./routes/index');
var users = require('./routes/users');
var nodes = require('./routes/nodes');
var roots = require('./routes/roots');
var sensors = require('./routes/sensors');
var data = require('./routes/data');
var locations = require('./routes/locations');
var jwt = require('jsonwebtoken');
var config = require('./config/token');

app.set('env', 'dev'); // set enviroment


config = config[app.get('env')];
app.set('superSecret', config.secret);
// console.log(app.get('superSecret'));
mongoose.connect(config.dbURL, (e) => {
  if (e) return console.log(e);
  console.log("Mongo connected");
});

app.use(function (req, res, next) {
  // var allowedOrigins = ['http://localhost:3000'];
  // var origin = req.headers.origin;
  // if (allowedOrigins.indexOf(origin) > -1) {
  //   res.setHeader('Access-Control-Allow-Origin', origin);
  // }
  // console.log('access url: ' + req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setTimeout(120000, function () {
    console.log('Request has timed out.');
    return res.send(408);
  });
  next();
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use('/', index);
app.use('/users', users);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.use((req, res, next) => {
  if ('OPTIONS' !== req.method) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function (err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          // console.log(decoded);
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
  } else {
    next();
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
var port = process.env.PORT || 8081;        // set our port

// SOcket IO
// var socketIOApp = require('http').createServer(handler)
// var io = require('socket.io')(socketIOApp);
server = require('http').createServer(app),
  io = require('socket.io').listen(server);
// var fs = require('fs');

// socketIOApp.listen(8081, function() {console.log('Socket on port 8081' )});

// function handler(req, res) {
//   res.end("Happy coding");
// }

// console.log(port);

function getRandomArbitrary(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

//io.configure(function () {  
// io.set("transports", ["xhr-polling"]); 
//io.set("polling duration", 10); 
//});

io.on('connection', function (socket) {
  console.log(socket.id + ' has connected!');
  socket.on('get_index', function(){
    var ran = function (min, max) {
      return parseFloat((Math.random() * (max - min) + min).toFixed(1));
    }

    setInterval(function () {
      var n = new Date();
      var val = {
        date: n,
        temp: ran(26, 30),
        hum: ran(60, 65),
        aqi: ran(1, 2)
      }
      io.sockets.to(socket.id).emit('get_index', val);
    }, 3000);
  })
});

// app.use('/api', router);

// START THE SERVER
// =============================================================================
server.listen(port);
console.log('Magic happens on port' + port);
