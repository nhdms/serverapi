var express = require('express');
var router = express.Router();
var Sensor = require('../models/Sensor');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');

/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: "nothing here", success: false });
});


router.get('/info', (req, res, next) => {
  // res.json(req.params.id);
  Sensor.findById(req.query.id, (err, result) => {
    if (err || !result || !result.name) return res.json({ success: false, msg: "Sensor not found" });
    return res.json({success:false, data : result});
  });
});


router.post('/add', (req, res, next) => {
  // var {name, description, type} = req.body;
  if (!!!req.body.name) return res.json({ success: false, msg: "Sensor's name is required" });
  if (!!!req.body.type) return res.json({ success: false, msg: "Sensor's type is required" });

  var sensor = new Sensor(req.body);
  sensor.save((e, r) => {
    if (e) return res.json({success:false, msg : e.message || e});
    return res.json({success: true, msg : `Adding sensor ${req.body.name}  successfully`});
  });
});

module.exports = router;
