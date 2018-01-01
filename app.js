
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
const express = require('express'), // call express
  app = express(), // define our app using express
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  cookieParser = require('cookie-parser'),
  //  router = require('./routes/api'),
  path = require('path'),
  redis = require("redis"),
  rclient = redis.createClient(),
  bluebird = require('bluebird'),
  index = require('./routes/index'),
  users = require('./routes/users'),
  nodes = require('./routes/nodes'),
  // roots = require('./routes/roots'),
  // sensors = require('./routes/sensors'),
  data = require('./routes/data'),
  // locations = require('./routes/locations'),
  jwt = require('jsonwebtoken'),
  DataModel = require('./models/Data'),
  NodeModel = require('./models/Node'),
  http = require('http'),
  https = require('https'),
  fs = require('fs')
// f = require('util').format

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const SECURE_KEY = '/etc/letsencrypt/live/seeyourair.com/privkey.pem',
  SECURE_CERT = '/etc/letsencrypt/live/seeyourair.com/fullchain.pem'

const privateKey = fs.readFileSync(SECURE_KEY, 'utf8'),
  certificate = fs.readFileSync(SECURE_CERT, 'utf8')

var credentials = {
  key: privateKey,
  cert: certificate
}

app.set('env', 'dev'); // set enviroment

var config = require('./config/token')

config = config[app.get('env')];
app.set('superSecret', config.secret);
// console.log(app.get('superSecret'));
// mongoose.connect(config.dbURL, config.dbOptions, (e) => {
//   if (e) return console.log(e);
//   console.log("Mongo connected");
// });

mongoose.connect(config.dbURL, config.dbOptions)
mongoose.Promise = global.Promise

const allowPaths = []
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  console.log(req.method)
  console.log(req.url)
  console.log(allowPaths.filter((i) => {
    return req.url.startsWith(i)
  }).length)
  if ('OPTIONS' !== req.method && req.url !== "/" && allowPaths.filter((i) => {
    return req.url.startsWith(i)
  }).length == 0) {
    try {
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
            console.log(decoded);
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
    } catch (ez) {
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
// app.use('/roots', roots);
app.use('/nodes', nodes);
// app.use('/sensors', sensors);
app.use('/data', data);
// app.use('/locations', locations);
app.get('/check-server', function (req, res) {
  res.json({
    serverName: process.env.SERVER_NAME
  })
})
app.get('*', (req, res) => {
  // res.json({message : "wassup"});
  return res.status(404).json({
    success: false,
    message: 'What???'
  });
})
var port = process.env.PORT || 8080; // set our port
// =============================================================================
// app.listen(port);
const httpServer = http.createServer(app),
  httpsServer = https.createServer(credentials, app)

httpServer.listen(port)
var httpsPort = 8443;
if (port == 8081) httpsPort = 8444
httpsServer.listen(httpsPort)
console.log('Magic happens on port' + port)

//=== MQTT SERVER===
// var mosca = require('mosca');
// // var moscaURL = f(config.moscaURL, encodeURIComponent(config.moscaOptions.user), encodeURIComponent(config.moscaOptions.password))
// // console.log(config.moscaURL)
// var ascoltatore = {
//   //using ascoltatore
//   type: 'mongo',
//   url: config.moscaURL,
//   pubsubCollection: 'ascoltatori',
//   mongo: {}
// };

// var settings = {
//   backend: ascoltatore,
//   http: {
//     port: 5000,
//     bundle: true
//   },
//   secure: {
//     port: 5443,
//     keyPath: SECURE_KEY,
//     certPath: SECURE_CERT,
//   },
//   allowNonSecure: true,
//   https: {
//     port: 6443,
//     bundle: true
//   }
// };
// var server = new mosca.Server(settings);
// var Nodes = require('./models/Node');
// server.on('clientConnected', function (client) {
//   var message = {
//     topic: 'client_connected',
//     payload: JSON.stringify({
//       id: client.id,
//       status: 1
//     })
//   };

//   server.publish(message, function () {
//     console.log('done!', client.id);
//   });

//   NodeModel.findByIdAndUpdate({
//     _id: client.id
//   }, {
//     $set: {
//       connected: 1
//     }
//   }, (err, ok) => {

//   });

// });

// server.on('clientDisconnected', function (client) {
//   var message = {
//     topic: 'client_connected',
//     payload: JSON.stringify({
//       id: client.id,
//       status: 0
//     })
//   };

//   server.publish(message, function () {
//     console.log('done!', client.id);
//   });

//   NodeModel.findByIdAndUpdate({
//     _id: client.id
//   }, {
//     $set: {
//       connected: 0
//     }
//   }, (err, ok) => {

//   });
// });

// async function processValue(topic, val, type) {
//   const top = topic + '_' + type,
//     lastValue = await rclient.getAsync(top)

//   console.log('OK', topic, val, lastValue)    
//   if (lastValue) {
//     const lastValArr = lastValue.split('_')
//     if (+lastValArr[0] === val) {
//       DataModel.findByIdAndUpdate({
//         _id: lastValArr[1]
//       }, {
//         $set: {
//           lastUpdate: new Date()
//         }
//       }, (exx, rr) => {

//       })
//     } else {
//       a = new DataModel({
//         type: type,
//         value: val,
//         nodeId: topic
//       })
//       a.save((ex, r) => {
//         if (!ex && r) {
//           rclient.set(top, val + '_' + r._id.toString())
//         }
//       })
//     }
//   } else {
//     a = new DataModel({
//       type: 0,
//       value: val,
//       nodeId: topic
//     })
//     a.save((ex, r) => {
//       if (!ex && r) {
//         rclient.set(top, val + '_' + r._id.toString())
//       }
//     })
//   }
// }

// // fired when a message is received
// server.on('published', function (packet, client) {
//   var str = packet.payload.toString()
//   var topic = packet.topic.toString()
//   //  console.log(str, topic)
//   if (topic.startsWith('NODE_')) {
//     rclient.set(topic, str + ' ' + Date.now());
//     // console.log('Published', packet.payload.toString());
//     var arr = str.split(' ')
//     // if (arr)
//     if (arr.length >= 3) {
//       if (!isNaN(arr[0])) {
//         processValue(topic, +arr[0], 0)
//       }

//       if (!isNaN(arr[1])) {
//         processValue(topic, +arr[1], 1)        
//       }

//       if (!isNaN(arr[2])) {
//         processValue(topic, +arr[2], 2)        
//       }
//     }
//   } else {
//     console.log(topic, 'x')
//   }
// });

// server.on('ready', setup);

// // fired when the mqtt server is ready
// function setup() {
//   console.log('Mosca server is up and running');
// }
