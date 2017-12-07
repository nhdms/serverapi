'use strict'
const mosca = require('mosca'),
  ascoltatore = {
    type: 'mongo',
    url: 'mongodb://127.0.0.1:27017/mqtt',
    pubsubCollection: 'ascoltatori',
    mongo: {}
  },
  settings = {
    port: 1883,
    backend: ascoltatore
  },
  server = new mosca.Server(settings),
  NodeModel = require('./models/Node'),
  DataModel = require('./models/Data'),
  redis = require("redis"),
  rclient = redis.createClient(),
  bluebird = require('bluebird')


server.on('clientConnected', function (client) {
  var message = {
    topic: 'client_connected',
    payload: JSON.stringify({
      id: client.id,
      status: 1
    })
  };

  server.publish(message, function () {
    console.log('done!', client.id);
  });

  NodeModel.findByIdAndUpdate({
    _id: client.id
  }, {
    $set: {
      connected: 1
    }
  }, (err, ok) => {

  });

});

server.on('clientDisconnected', function (client) {
  var message = {
    topic: 'client_connected',
    payload: JSON.stringify({
      id: client.id,
      status: 0
    })
  };

  server.publish(message, function () {
    console.log('done!', client.id);
  });

  NodeModel.findByIdAndUpdate({
    _id: client.id
  }, {
    $set: {
      connected: 0
    }
  }, (err, ok) => {

  });
});

async function processValue(topic, val, type) {
  const top = topic + type,
    lastValue = await rclient.getAsync(top)

  console.log('OK', topic, val, lastValue)
  if (lastValue) {
    const lastValArr = lastValue.split('_')
    if (+lastValArr[0] === val) {
      DataModel.findByIdAndUpdate({
        _id: lastValArr[1]
      }, {
        $set: {
          lastUpdate: new Date()
        }
      }, (exx, rr) => {

      })
    } else {
      a = new DataModel({
        type: type,
        value: val,
        nodeId: topic
      })
      a.save((ex, r) => {
        if (!ex && r) {
          rclient.set(top, val + '_' + r._id.toString())
        }
      })
    }
  } else {
    a = new DataModel({
      type: 0,
      value: val,
      nodeId: topic
    })
    a.save((ex, r) => {
      if (!ex && r) {
        rclient.set(top, val + '_' + r._id.toString())
      }
    })
  }
}

// fired when a message is received
server.on('published', function (packet, client) {
  var str = packet.payload.toString()
  var topic = packet.topic.toString()
  //  console.log(str, topic)
  if (topic.startsWith('NODE_')) {
    rclient.set(topic, str + ' ' + Date.now());
    // console.log('Published', packet.payload.toString());
    var arr = str.split(' ')
    // if (arr)
    if (arr.length >= 3) {
      if (!isNaN(arr[0])) {
        processValue(topic, +arr[0], 0)
      }

      if (!isNaN(arr[1])) {
        processValue(topic, +arr[1], 1)
      }

      if (!isNaN(arr[2])) {
        processValue(topic, +arr[2], 2)
      }
    }
  } else {
    console.log(topic, 'x')
  }
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}
