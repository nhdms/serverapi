var express = require('express');
var router = express.Router();
var Nodes = require('../models/Node');
// var Location = require('../models/Location');
var Utils = require('../Util/Utils');
var ObjectId = require('mongoose').Types.ObjectId;


/* GET users listing. */
// router.post('')

router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: "nothing here", success: false });
});


router.get('/:id', (req, res, next) => {
  // res.json(req.params.id);
  Node.findById(req.params.id, (err, result) => {
    if (err || !result.name) return res.json({ success: false, msg: "Root not found" });
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
