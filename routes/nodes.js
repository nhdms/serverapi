var express = require('express');
var router = express.Router();
var Nodes = require('../models/Node');
var Data = require('../models/Data');
var Following = require('../models/Following');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');
var ObjectId = require('mongoose').Types.ObjectId;
var cheerio = require('cheerio')

/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({
    message: "nothing here",
    success: false
  });
});

router.get('/unfollow', (req, res, next) => {
  var uid = req.decoded._doc._id;
  var deviceId = req.query.deviceId;
  Following.remove({
    uid: uid,
    deviceId: deviceId
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

router.get('/nodes', (req, res, next) => {
  Utils.getNodeByLocationId(req.query.lid, function (e, resp) {
    // console.log(resp)
    if (e) return res.json({
      success: false,
      msg: e.message || e
    });
    return res.json({
      success: true,
      data: resp
    })
  })
});


router.use('/follow', (req, res, next) => {
  var uid = req.decoded._doc._id;
  // var check = new ObjectId(uid);
  var deviceId = req.query.deviceId;
  Following.find({
    uid: uid,
    deviceId: deviceId
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


// Tạm thời code như một đống rác trước, hôm sau(chưa biết khi nào) sẽ sửa
async function getDataNow(id = 'NODE_001') {
  var temp = await Data.find({type: 0, nodeId: id}).sort({created: -1}).limit(1).lean()
  var hum = await Data.find({type: 2, nodeId: id}).sort({created: -1}).limit(1).lean()
  var aqi = await Data.find({type: 1, nodeId: id}).sort({created: -1}).limit(1).lean()
  // console.log(temp)
  return {
    temp: temp[0] ? temp[0].value : 0,
    hum: hum[0] ? hum[0].value : 0,
    pm2: aqi[0] ? aqi[0].value : 0, 
    lastUpdated: aqi[0] ? aqi[0].created : undefined
  }
}

// router.get('/')
router.get('/follow', (req, res, next) => {
  // res.json();
  try {
    // var check = new ObjectId(req.de)
    var uid = req.decoded._doc._id;
    var check = new ObjectId(uid);
    var deviceId = req.query.deviceId;
    // res.json(deviceId);
    // console.log(a)
    Nodes.findById(deviceId, (err, result) => {
      // console.log(err, result);
      if (err || !result.name) return res.json({
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
        deviceId: deviceId
      });

      follow.save((er, r) => {
        if (er) return res.json({
          success: false,
          msg: er.message || er
        });
        return res.json({success: true,
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
     b = await Data.find({nodeId: id}).sort({created: -1}).limit(1).lean()
     return res.json({success: true, data: Object.assign(a, b)})
  } else {
    ns = await Nodes.find({}).lean()
    t = await Data.aggregate([
{$match: {type: 0}},
{$group: {"_id": "$nodeId", value: {$last: "$value"}}}
])
   h = await Data.aggregate([
{$match: {type: 2}},
{$group: {"_id": "$nodeId", value: {$last: "$value"}}}
])
 a = await Data.aggregate([
{$match: {type: 1}},
{$group: {"_id": "$nodeId", value: {$last: "$value"}, lastModified: {$last: "$created"}}}
])

  te = {}
  t.map(i => {te[i._id] = i.value})

  hu = {}
  h.map(i => {hu[i._id] = i.value})

 aq = {}
 a.map(i  => {
 aq[i._id] = {
  val : i.value,
  lastUpdate: i.lastModified
 }
})
res.json({
	success: true, 
	data: ns.map(i => Object.assign(i, {now: {temp: te[i._id], hum: hu[i._id], pm2: aq[i._id].val, lastUpdate: aq[i._id].lastUpdate}}))})
  }
});


router.post('/', (req, res, next) => {
  var {
    name,
    description,
    rootId
  } = req.body;
  if (!!!name) return res.json({
    success: false,
    msg: "Node's name is required"
  });
  if (rootId) {
    Utils.validateRoot(rootId, (err, result) => {
      // if (err) return res.json({success : false, msg : err.message || err});
      if (err || !result.name) return res.json({
        success: false,
        msg: "Root not found!"
      });
      root = new Nodes(req.body);
      root.save((e) => {
        if (e) return res.json({
          success: false,
          msg: e.message || e
        });
        return res.json({
          success: true,
          msg: "Adding node successfully"
        });
      });
    });
  } else {
    root = new Nodes(req.body);
    root.save((e) => {
      if (e) return res.json({
        success: false,
        msg: e.message || e
      });
      return res.json({
        success: true,
        msg: "Adding node successfully"
      });
    });
  }
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

module.exports = router;
