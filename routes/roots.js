var express = require('express');
var router = express.Router();
var Root = require('../models/Root');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');
var ObjectId = require('mongoose').Types.ObjectId;
var Following = require('../models/Following');

/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: "nothing here", success: false });
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


router.get('/unfollow', (req, res, next) => {
  var uid = req.decoded._doc._id;
  var deviceId = req.query.deviceId;
  Following.remove({uid : uid, deviceId : deviceId}, (e,r) => {
    if (e) return res.json({success: false, msg : e.message || e});
    return r.result.n ? res.json({success: true}) : res.json({success: false, msg : "You're not following this device"});
  });
});

router.get('/follow', (req, res, next) => {
  // res.json();
  try {
    // var check = new ObjectId(req.de)
    var uid = req.decoded._doc._id;
    var check = new ObjectId(uid);
    var deviceId = req.query.deviceId;
    // res.json(deviceId);

    Root.findById(deviceId, (err, result) => {
      // console.log(err, result);
      if (err || !result.name) return res.json({ success: false, msg: "Root not found" });
      // Utils.getLocationById(result.locationId, (e, r) => {
      //   if (e) return res.json({ success: false, msg: "Cannot get location for this root" });
      //   result.locationId = r;
      //   return res.json({ success: true, data: result });
      // });
      var follow = new Following({
        uid: uid,
        deviceId: deviceId
      });

      follow.save((er, r) => {
        if (er) return res.json({ success: false, msg: er.message || er });
        return res.json({ success: true, msg: `You've followed device: ${result.name}` });
      });
    });
  } catch (e) {
    return res.json({ success: false, msg: "Cannot find current user or deviceId, try to refresh this page", details: e.message || e });
  }
});

router.get('/:id', (req, res, next) => {
  // res.json(req.params.id);
  Root.findById(req.params.id, (err, result) => {
    if (err || !result.name) return res.json({ success: false, msg: "Root not found" });
    Utils.getLocationById(result.locationId, (e, r) => {
      if (e) return res.json({ success: false, msg: "Cannot get location for this root" });
      result.locationId = r;
      return res.json({ success: true, data: result });
    });
  });
});


router.post('/add', (req, res, next) => {
  if (!!!req.body.name) return res.json({ success: false, msg: "Root's name is required" });
  if (!!!req.body.locationId) return res.json({ success: false, msg: "Location id is required" });
  Utils.validateLocation(req.body.locationId, (err, result) => {
    // console.log(err, result)
    // if (err) return res.json({success : false, msg : err.message || err});
    if (err || !result.name) return res.json({ success: false, msg: "Location not found!" });
    root = new Root(req.body);
    root.save((e) => {
      if (e) return res.json({ success: false, msg: e.message || e });
      return res.json({ success: true, msg: "Adding root successfully" });
    });
  });
});

module.exports = router;
