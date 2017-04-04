var express = require('express');
var router = express.Router();
var config = require('../config/token');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var ObjectId = mongoose.Types.ObjectId;
// var config = {
// 	secret : "ABCXYZ"
// }
var User = require('../models/User');
var Data = require('../models/Data');
var Node = require('../models/Node');
var Sensor = require('../models/Sensor');
/* GET users listing. */
router.get('/', (req, res, next) => {
	res.json({"message" : "HAPPY CODING!"});
});

router.post('/login', (req, res, next) => {
	var username = req.body.username || "";
	var password = req.body.password || "";
	if ("" == username || "" == password) return res.json({success: false, msg : "User or password is required"});
	User.findOne({username : username}, (err, user) => {
		if (err) return res.json(err);
		if (!user) {
			return res.json({success: false, msg : "Authentication failed. User not found!"});
		} else {
			// console.log(password)
			user.comparePassword(password, (err, isMatch) => {
				// console.log(err, isMatch)
				if (isMatch && !err) {
					var token = jwt.sign(user, config.secret);
					res.json({success: true, token: token});
				} else {
					res.json({success: false, msg : "Authentication failed. Wrong password"})
				}
			})
		}
	});
});


router.post('/signup', (req, res, next) => {
	var username = req.body.username || "";
	var password = req.body.password || "";
	if ("" == username || "" == password) return res.json({success: false, msg : "User or password is required"});
	var newUser = new User({
		username : username,
		password : password,
	});

	User.findOne({username : username}, (err, user) => {
		if (!err && !user) {
			newUser.save((err,r ) => {
				// console.log(err, r)
				if (err) return res.json({success:false, msg : 'Username already exists'});
				res.json({success: true, msg : "Successful created new user."});
			});
		} else {
			return res.json({success:false, msg : 'Username already exists'});
		}
	});
});

// Sensorid = ['temp', 'hum', ...]
router.get('/analytic', (req, res, next) => {
	var start = req.query.start || Date.now();
	var end = req.query.end || Date.now();
	if (start > end) {
		start = Date.now();
		end = Date.now();
	}

	var sensor = req.query.sensor || "[]";
	var nodeId = req.query.nodeId || null;

	var fields = {
		"created" : 1
	};

	var series = [];
	try {
		sensor = JSON.parse(sensor);
		for (i in sensor) {
			fields['value.' + sensor[i]] = 1;
			series.push(sensor[i]);
		}
	} catch (e) {}

	var result = {
		label : [], 
		series : series,
		data : []
	};
	Data.find({"nid" : nodeId, created : {"$gte": new Date(+start), "$lt": new Date(+end)}}, fields, 
	{
		sort: {
			created : -1
		},
		limit : 30
	},  (e,r) => {
		result.label = r.map((i) => {
			var date = new Date(i.created);
			return date.getDate() + "/" + (date.getMonth() + 1);
		});

		for (i in series) {
			result.data.push(r.map(item => {
				// console.log(i.value.aqi);
				return item.value[series[i]];
			}))
		}

		res.json(result);
	});
});


router.get('/node/:id', (req, res, next) => {
	// console.log(req.params)
	Node.findById(req.params.id , (e,r) => {
		// console.log(e,r)
		if (e) return res.json({success : false, msg : e});

		// console.log(Object.keys(r.component))
		// console.log(JSON.stringify(r.component));
		var obj = JSON.parse(JSON.stringify(r));
		for (i in obj.component) {
			// console.log(i)
			Sensor.findById(obj.component[i], (er, rr) => {
				// console.log(obj, i)
				if (!er && rr) {
					obj.component[i] = rr;
					// console.log(obj);
				}
			});
		}


		// r.component = obj;
		res.json(obj);
	})
	// res.json(req.params);
});


router.get('/user/:username', (req, res, next) => {
	User.findOne({"username" : req.params.username} , (e,r) => {
		if (e) return res.json({success : false, msg : e});
		if (!r) return res.json({success: false, msg : "User not found"});
		var obj = JSON.parse(JSON.stringify(r));
		delete obj.password;
		res.json(obj);
	})
	// res.json(req.params);
});


// router.post('/node', (req, res, next) => {
// 	var {name, description} = req.body;
// 	try {
// 		component = JSON.parse(req.body.component)
// 	}
// })

module.exports = router;

// TEST
	// var data = new Data({
	// 	value : 
	// });

	// var temp = new Sensor({
	// 	name : "nhiet do",
	// 	type : "nhietdo",
	// 	description : "do nhiet do"
	// });

	// var hum = new Sensor({
	// 	name : "do am",
	// 	type : "doam",
	// 	description : "Do do am"
	// });

	// var aqi = new Sensor({
	// 	name : "CLKK",
	// 	type : "kk",
	// 	description : "do chat luong khong khi"
	// });

	// temp.save(console.log);
	// hum.save(console.log);
	// aqi.save(console.log);

	// var node = new Node({
	// 	name : "Node1",
	// 	description : "NONE",
	// 	// rootId : "",
	// 	component : {
	// 		temp : "58e32e32090bcc048cd11abb",
	// 		hum : "58e32e32090bcc048cd11abc",
	// 		aqi : "58e32e32090bcc048cd11abd",
	// 	}
	// });

	// node.save(console.log);

	// var ran = function(max, min) {
	// 	return Math.random() * (max - min + 1) + min;
	// }

	// var node = new Data({
	// 	created : new Date(2017,3, Math.floor(ran(28,2))).toISOString(),
	// 	value : {
	// 		temp: ran(40,5),
	// 		hum: ran(100, 30),
	// 		aqi: ran(10,0)
	// 	},
	// 	nid : "58e32f3cb7b33f32e4b25271"
	// })

	// node.save((e,r) => {
	// 	res.json(r);
	// })