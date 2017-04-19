var express = require('express');
var router = express.Router();
var Location = require('../models/Location');
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
    var id = req.query.id;
    Location.findById(id, (err, result) => {
        // res.json({});
        if (err) return res.json({success: false, msg : err.message || err});
        return res.json({success : true, data : result});
    });
});


router.post('/add', (req, res, next) => {
    if (!!!req.body.name) return res.json({ success: false, msg: "Location's name is required" });
    if (!!!req.body.address) return res.json({ success: false, msg: "Location's address is required" });
    if (!!!req.body.longtitude || !!!req.body.latitude) return res.json({ success: false, msg: "Missing longtitude or latitude" });
    else {
        //   res.json({success:false})
        newLocation = new Location({
            name: req.body.name,
            address: req.body.address,
            coordinate: {
                longtitude: req.body.longtitude,
                latitude: req.body.latitude
            }
        });
        newLocation.save((err, result) => {
            // console.log(err, result);
            if (err) return res.json({ success: false, msg: err.message || err });
            return res.json({ success: true, msg: `Adding location ${req.body.name} successfully` });
        });
    }
});

module.exports = router;
