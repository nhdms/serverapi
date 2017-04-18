var express = require('express');
var router = express.Router();
var Data = require('../models/Data');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/chart', (req, res, next) => {
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

router.get('*', function(req, res, next) {
  // res.send('respond with a resource');
  return res.json({success: false, msg : "Under construction"});
});

router.post('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
