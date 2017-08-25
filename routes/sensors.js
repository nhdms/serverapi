var express = require('express');
var router = express.Router();
var Sensor = require('../models/Sensor');
var Node = require('../models/Node');
var Utils = require('../Util/Utils');

/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: "nothing here", success: false });
});


router.get('/info', (req, res, next) => {
  // res.json(req.params.id);
  var id = req.query.id;
  if (id) {
    Sensor.findById(id, (err, result) => {
      if (err || !result || !result.name) return res.json({ success: false, msg: "Sensor not found" });
      return res.json({ success: true, data: result });
    });
  } else if (req.query.nodeId) {
    // console.log('dsg', req.query.nodeId);
    Sensor.find({nodeId : req.query.nodeId}, (err, result) => {
      if (err || !result) return res.json({ success: false, msg: "Sensor not found" });
      return res.json({ success: true, data: result });
    });
  }
  else {
    Sensor.find({}, (err, result) => {
      if (err || !result) return res.json({ success: false, msg: "Sensor not found" });
      return res.json({ success: true, data: result });
    });
  }
});


router.post('/', (req, res, next) => {
  // var {name, description, type} = req.body;
  if (!!!req.body.name) return res.json({ success: false, msg: "Sensor's name is required" });
  if (!!!req.body.type) return res.json({ success: false, msg: "Sensor's type is required" });

  var sensor = new Sensor(req.body);
  if (req.body.nodeId) {
    Utils.validateNode(req.body.nodeId, (err, result) => {
      // if (err) return res.json({success : false, msg : err.message || err});
      if (err || !result.name) return res.json({ success: false, msg: "Node not found!" });
      sensor.save((e, r) => {
        if (e) return res.json({ success: false, msg: e.message || e });
        return res.json({ success: true, msg: `Adding sensor ${req.body.name}  successfully` });
      });
    });
  } else {
    sensor.save((e, r) => {
      if (e) return res.json({ success: false, msg: e.message || e });
      return res.json({ success: true, msg: `Adding sensor ${req.body.name}  successfully` });
    });
  }

});

router.put('/', (req, res, next) => {
  Sensor.update({_id : req.body._id}, {$set : req.body}, function(err, result) {
    if (err) return res.json({success:false, msg : err.message || err});
    return res.json({success:true});  
  });
});

router.delete('/', (req, res, next) => {
  // Sensor.remove();
  Sensor.findById(req.query.id).remove(function(e, r) {
    if (e) return res.json({success: false, msg : e.message || e});
    return res.json({success: true});
  })
})

module.exports = router;
