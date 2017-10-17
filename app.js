// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
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

var DataModel = require('./models/Data')
var NodeModel = require('./models/Node')
var f = require('util').format
app.set('env', 'dev2'); // set enviroment


config = config[app.get('env')];
app.set('superSecret', config.secret);
// console.log(app.get('superSecret'));
mongoose.connect(config.dbURL, config.dbOptions, (e) => {
  if (e) return console.log(e);
  console.log("Mongo connected");
});
const allowPaths = ['/', '/users']
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if ('OPTIONS' !== req.method && req.url !== "/" && allowPaths.filter((i) => {
      return req.url.startsWith(i)
    }).length == 0) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function (err, decoded) {
        if (err) {
          return res.json({
            success: false,
            message: 'Failed to authenticate token.'
          });
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

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', index);
app.use('/users', users);
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
var port = process.env.PORT || 8080; // set our port
// =============================================================================
app.listen(port);
console.log('Magic happens on port' + port);

//=== MQTT SERVER===
var mosca = require('mosca');
var moscaURL = f(config.moscaURL, encodeURIComponent(config.moscaOptions.user), encodeURIComponent(config.moscaOptions.password))
console.log(moscaURL)
var ascoltatore = {
  //using ascoltatore
  type: 'mongo',
  url: moscaURL,
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

var settings = {
  backend: ascoltatore,
  http: {
    port: 5000,
    bundle: true
  }
};
var server = new mosca.Server(settings);
server.on('clientConnected', function (client) {
  console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function (packet, client) {
  var str = packet.payload.toString()
  console.log(str)
  var arr = str.split(' ')
  if (+arr[1] > 0) {
    var hum = {
      value: +arr[1],
      nodeId: +arr[5] || 1251166,
      type: 2
    }
    var a = new DataModel(hum)
    a.save((err) => {
      // console.log('e ', err)
    })
  }

  if (+arr[2] > 0) {
    var hum = {
      value: +arr[2],
      nodeId: +arr[5] || 1251166,
      type: 0
    }
    var a = new DataModel(hum)
    a.save((err) => {
      // console.log('e ', err)
    })
  }

  if (+arr[3] >= 0) {
    var hum = {
      value: +arr[3],
      nodeId: +arr[5] || 1251166,
      type: 1
    }
    var a = new DataModel(hum)
    a.save((err) => {
      // console.log('e ', err)
    })
  }

  console.log('Published', packet.payload.toString());
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}