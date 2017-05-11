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

mongoose.connect('mongodb://root:12345679@ds137281.mlab.com:37281/heroku_jz559sxc', (e) => {
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
var config = require('./config/token');
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

// SOcket IO
// var socketIOApp = require('http').createServer(handler)
// var io = require('socket.io')(socketIOApp);

var server = require('http').Server(app);
var io = require('socket.io')(server);
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
  var now = Date.now();
  var temp = {
    time: {
      exec: now - 1000,
      upload: now
    },
    value: getRandomArbitrary(28, 39),
    unit: String.fromCharCode(176) + 'C',
    type: 'temp'
  };
  now = Date.now();

  var hum = {
    time: {
      exec: now - 1000,
      upload: now
    },
    value: getRandomArbitrary(60, 100),
    unit: '%',
    type: 'hum'
  };

  now = Date.now();
  var aqi = {
    time: {
      exec: now - 1000,
      upload: now
    },
    value: getRandomArbitrary(3, 6),
    unit: '%',
    type: 'aqi'
  };


  
  socket.emit('news', { hello: 'world' });
  socket.on('get_index', function (data) {
    // console.log(data);
    // var current = Date.now();
    
    setInterval(() => {
      // setTimeout(() => {
      //   temp.current = current;
      //   socket.emit('get_index', temp);
      // }, 0);

      // setTimeout(() => {
      //   hum.current = current;
      //   socket.emit('get_index', hum);
      // }, 300);

      // setTimeout(() => {
      //   aqi.current = current;
      //   socket.emit('get_index', aqi);
      // }, 800);
      var all = {
    time: {
      exec: now - 1000,
      upload: now
    },
    values: {
      aqi: {
        value: getRandomArbitrary(3, 6),
        unit: '%',
      },
      hum: {
        value: getRandomArbitrary(60, 100),
        unit: '%',
      },
      temp: {
        value: getRandomArbitrary(25, 38),
        unit: String.fromCharCode(176) + 'C',
      }
    }
    // type : 'aqi'    
  };
      socket.emit('get_index', all);
    }, 1000);
  });
});

// app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port' + port);
