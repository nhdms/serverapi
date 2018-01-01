
var express = require('express');
var router = express.Router();
var Nodes = require('../models/Node');
var Users = require('../models/User')
var Data = require('../models/Data');
// var History = require('../models/History');
var Following = require('../models/Following');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');
var ObjectId = require('mongoose').Types.ObjectId;
var cheerio = require('cheerio')
var redis = require("redis"),
  bluebird = require('bluebird'),
  rclient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
/* GET users listing. */
// router.post('')

var jwt = require('jsonwebtoken');

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({
    message: "nothing here",
    success: false
  });
});

router.get('/unfollow', (req, res, next) => {
  var uid = req.decoded._id;
  var deviceId = req.query.deviceId;
  Following.remove({
    uid: uid,
    nodeid: deviceId
  }, (e, r) => {
    if (e) return res.json({
      success: false,
      msg: e.message || e
    });
    return r.result.n ? res.json({
      success: true
    }) : res.json({
      success: false,
      msg: "You're not following this device"
    });
  });
});

router.post('/new_node', (req, res, next) => {
  var node = new Nodes({
    _id: req.body.nodeid,
    password: req.body.password,
    isPrivate: req.body.isPrivate
  })
  node.save((err) => {
    if (err) {
      res.json({
        success: false,
        message: err.toString()
      })
    } else {
      res.json({
        success: true,
        data: node
      })
    }
  })
});

//api thêm node
router.post('/add', isVerifyToken, (req, res, next) => {
  Nodes.findOneAndUpdate({
    _id: req.body.nodeid,
    password: req.body.password,
  }, {
      $set: {
        name: req.body.name,
        description: req.body.description,
        current_location: {
          longitude: req.body.longitude,
          latitude: req.body.latitude
        }
      }
    }, (err, node) => {
      if (err) {
        res.json({
          success: false,
          message: err.toString()
        })
      } else if (!node) {
        res.json({
          success: false,
          message: "Không tồn tại thiết bị"
        })
      } else {
        Users.findOneAndUpdate(
          req.decoded._id, {
            $addToSet: {
              owner_nodeIds: req.body.nodeid
            }
          }, (err, user) => {
            console.log(err)
            console.log(user)
            res.json({
              success: true,
              data: node
            })
          })
      }
    })
})

router.get('/controls', isVerifyToken, (req, res) => {
  Users.findById(req.decoded._id, (err, user) => {
    if (!user) {
      res.json({
        success: false
      })
    } else {
      Nodes.find({
        _id: {
          $in: user.owner_nodeIds
        },
        node_type: 2
      }, (err, nodes) => {
        if (!nodes) {
          res.json({
            success: false
          })
        } else {
          res.json({
            success: true,
            data: nodes
          })
        }
      })
    }
  })
})

router.get('/nodes', (req, res, next) => {
  // Utils.getNodeByLocationId(req.query.lid, function (e, resp) {
  //   // console.log(resp)
  //   if (e) return res.json({
  //     success: false,
  //     msg: e.message || e
  //   });
  //   return res.json({
  //     success: true,
  //     data: resp
  //   })
  // })
});

router.use('/follow', isVerifyToken, (req, res, next) => {
  var uid = req.decoded._id;
  // var check = new ObjectId(uid);
  var deviceId = req.query.deviceId;

  Following.find({
    uid: uid,
    nodeid: deviceId
  }, (e, r) => {
    // console.log(e, r);
    if (e) return res.json({
      success: false,
      msg: e.message || e
    });
    // console.log(r)
    if (r.length) return res.json({
      success: false,
      msg: "Already followed"
    });
    next();
  })
});

async function getDataNow(id = 'NODE_001') {
  var temp = await Data.find({
    type: 0,
    nodeId: id
  }).sort({
    created: -1
  }).limit(1).lean()
  var hum = await Data.find({
    type: 2,
    nodeId: id
  }).sort({
    created: -1
  }).limit(1).lean()
  var aqi = await Data.find({
    type: 1,
    nodeId: id
  }).sort({
    created: -1
  }).limit(1).lean()
  // console.log(temp)
  return {
    temp: temp[0] ? temp[0].value : 0,
    hum: hum[0] ? hum[0].value : 0,
    pm2: aqi[0] ? aqi[0].value : 0,
    lastUpdated: aqi[0] ? aqi[0].created : undefined
  }
}

// router.get('/')
router.get('/follow', isVerifyToken, (req, res, next) => {
  // res.json();
  try {
    // var check = new ObjectId(req.de)
    var uid = req.decoded._id;
    var check = new ObjectId(uid);
    var deviceId = req.query.deviceId;
    // res.json(deviceId);
    // console.log(a)
    Nodes.findById(deviceId, (err, result) => {
      // console.log(err, result);
      if (err || !result.name || result.isPrivate) return res.json({
        success: false,
        msg: "Node not found"
      });
      // Utils.getRootById(result.locationId, (e, r) => {
      //   if (e) return res.json({ success: false, msg: "Cannot get location for this root" });
      //   result.locationId = r;
      //   return res.json({ success: true, data: result });
      // });
      var follow = new Following({
        uid: uid,
        nodeid: deviceId
      });

      follow.save((er, r) => {
        if (er) return res.json({
          success: false,
          msg: er.message || er
        });
        return res.json({
          success: true,
          msg: `You've follow device: ${result.name}`
        });
      });
    });
  } catch (e) {
    return res.json({
      success: false,
      msg: "Cannot find current user or deviceId, try to refresh this page",
      details: e.message || e
    });
  }
});

router.get('/info', async (req, res, next) => {
  var id = req.query.id;
  if (id) {
    a = await Nodes.findById(id).lean()
    b = await Data.find({
      nodeId: id
    }).sort({
      created: -1
    }).limit(1).lean()
    return res.json({
      success: true,
      data: Object.assign(a, b)
    })
  } else {

    var ns = await Nodes.find({}).lean()
    let p = []
    for (let i = 0; i < ns.length; i++) {
      p.push(rclient.getAsync(ns[i]._id))
    }
    let nsp = await Promise.all(p)

    res.json({
      success: true,
      data: ns.map((e, i) => {
        try {
          let arr = nsp[i].split(' ')
          return Object.assign(e, {
            now: {
              temp: +arr[0],
              hum: +arr[1],
              pm2: +arr[2],
              lastUpdated: +arr[3] || 0
            }
          })
        } catch (ex) {
          return Object.assign(e, {
            now: {}
          })
        }
      })
    })
  }
});

router.get('/infos', isVerifyToken, async (req, res, next) => {
  var uid = req.decoded._id;
  Following.find({
    uid: uid
  }, (e, follows) => {
    if (e) return res.json({
      success: false,
      msg: e.message || e
    });
    var nodeIds = follows.map((f) => {
      return f.nodeId
    })
    var ns = await Nodes.find({ _id: { $in: nodeIds }, node_type: 1 }).lean()
    let p = []
    for (let i = 0; i < ns.length; i++) {
      p.push(rclient.getAsync(ns[i]._id))
    }
    let nsp = await Promise.all(p)

    res.json({
      success: true,
      data: ns.map((e, i) => {
        try {
          let arr = nsp[i].split(' ')
          return Object.assign(e, {
            now: {
              temp: +arr[0],
              hum: +arr[1],
              pm2: +arr[2],
              lastUpdated: +arr[3] || 0
            }
          })
        } catch (ex) {
          return Object.assign(e, {
            now: {}
          })
        }
      })
    })

  })

});



router.post('/', (req, res, next) => {
  var {
    name,
    description
    // rootId
  } = req.body;
  if (!!!name) return res.json({
    success: false,
    msg: "Node's name is required"
  });
  let node = new Nodes({
    name: name,
    description: description,
    _id: req.body._id ? req.body._id : name,
    current_location: {
      longitude: 0,
      latitude: 0
    }
  })
  node.save((e, r) => {
    if (e) return res.json({
      success: false,
      msg: e.message || e
    })
    return res.json({
      success: true
    })
  })
});

router.delete('/', (req, res, next) => {
  // Sensor.remove();
  Nodes.findById(req.query.id).remove(function (e, r) {
    if (e) return res.json({
      success: false,
      msg: e.message || e
    });
    return res.json({
      success: true
    });
  })
})

router.put('/', async (req, res, next) => {
  let {
    _id,
    name,
    description,
    location
  } = req.body
  // console.log(req.body)
  // res.json(id)
  let isValid = false
  if (_id) {
    let set = {}
    const put = {}
    if (name) set['name'] = name
    else if (description) set['description'] = description
    else if (location) {
      try {
        const currentNode = await Nodes.findById(_id)
        // console.log(currentNode)
        const arr = location.split('-')
        if (Number(arr[0]) && Number(arr[0])) {
          set['current_location.latitude'] = +arr[0]
          set['current_location.longitude'] = +arr[1]
          put['location'] = {
            latitude: +arr[0],
            longitude: +arr[1]
          }
          // put['location.latitude'] = +arr[0]
          // put['location.longitude'] = +arr[1]
          put['created'] = new Date()
          // isValid = true
        }
      } catch (e) {

      }
    }
    // console.log(set, put)
    Nodes.findByIdAndUpdate({
      _id: _id
    }, {
        $set: set
      }, (err, ok) => {
        // console.log(err)
        if (err) {
          return res.json({
            success: false,
            msg: err.message || err
          })
        } else {
          res.json({
            success: true
          })

          Nodes.findByIdAndUpdate({
            _id: _id
          },
            {
              $push: { history_locations: put }
            }, (er, o) => {
              console.log('e', er)
            })
        }
      })
  } else {
    return res.json({
      success: false,
      msg: 'Id not found'
    })
  }
})


function isVerifyToken(req, res, next) {
  try {
    var token = req.query.token || req.body.token || req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, 'ABC', function (err, decoded) {
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
  } catch (err) {
    console.log(err)
    return res.status(403).json({
      success: false,
      message: 'No token provided.'
    });
  }
}

module.exports = router;