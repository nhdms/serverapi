var express = require('express');
var router = express.Router();
var Nodes = require('../models/Node');
var Following = require('../models/Following');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');
var ObjectId = require('mongoose').Types.ObjectId;


/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: "nothing here", success: false });
});

router.get('/unfollow', (req, res, next) => {
  var uid = req.decoded._doc._id;
  var deviceId = req.query.deviceId;
  Following.remove({uid : uid, deviceId : deviceId}, (e,r) => {
    if (e) return res.json({success: false, msg : e.message || e});
    return r.result.n ? res.json({success: true}) : res.json({success: false, msg : "You're not following this device"});
  });
});

router.use('/follow', (req, res, next) => {
  var uid = req.decoded._doc._id;
  // var check = new ObjectId(uid);
  var deviceId = req.query.deviceId;
  Following.find({uid : uid, deviceId : deviceId}, (e, r)=> {
    // console.log(e, r);
    if (e) return res.json({success : false, msg: e.message || e});
    // console.log(r)
    if (r.length) return res.json({success:false, msg : "Already followed"});
    next();
  })
});

router.get('/follow', (req, res, next) => {
  // res.json();
  try {
    // var check = new ObjectId(req.de)
    var uid = req.decoded._doc._id;
    var check = new ObjectId(uid);
    var deviceId = req.query.deviceId;
    // res.json(deviceId);
    
    Nodes.findById(deviceId, (err, result) => {
      // console.log(err, result);
      if (err || !result.name) return res.json({ success: false, msg: "Node not found" });
      // Utils.getLocationById(result.locationId, (e, r) => {
      //   if (e) return res.json({ success: false, msg: "Cannot get location for this root" });
      //   result.locationId = r;
      //   return res.json({ success: true, data: result });
      // });
      var follow = new Following({
        uid : uid,
        deviceId : deviceId
      });

      follow.save((er, r) => {
        if (er) return res.json({success:false, msg : er.message || er});
        return res.json({success: true, msg : `You've follow device: ${result.name}`});
      });
    });
  } catch(e) {
    return res.json({success : false, msg : "Cannot find current user or deviceId, try to refresh this page", details: e.message || e});
  }
});

router.get('/:id', (req, res, next) => {
  // res.json(req.params.id);
  Node.findById(req.params.id, (err, result) => {
    if (err || !result.name) return res.json({ success: false, msg: "Node not found" });
    Utils.getLocationById(result.locationId, (e, r) => {
      if (e) return res.json({ success: false, msg: "Cannot get location for this root" });
      result.locationId = r;
      return res.json({ success: true, data: result });
    });
  });
});


router.post('/add', (req, res, next) => {
  var { name, description, rootId, component } = req.body;
  if (!!!name) return res.json({ success: false, msg: "Node's name is required" });
  // if (!!!rootId) return res.json({ success: false, msg: "Root id is required" }); // 

  try {
    component = JSON.parse(component.trim());
    // return console.log(component);
    // return res.json(component);
    var oids = component.map((e) => { return new ObjectId(oids)});
    console.log(oids);
    (new Nodes).findByIds(oids, (e, r) => {
      // console.log(ids);
      if (e) return res.json({success:false, msg : e.message || e});
      return res.json({success:true, data: r});
    });
  } catch (err) {
    console.log(err);
    // component = {};
    return res.json({ success: false, msg: "Cannot add sensor", details: err });
  }
});

module.exports = router;
