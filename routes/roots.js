var express = require('express');
var router = express.Router();
var Root = require('../models/Root');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');

/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: "nothing here", success: false });
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
