var express = require('express');
var router = express.Router();
var Data = require('../models/Data');
var Utils = require('../Util/Utils');

/* GET users listing. */
router.get('/', function (req, res, next) {
	return res.json({ success: false, msg: "Under construction" });
});
router.get('/saferange', function(req, res, next) {
	return res.json({success: true, data: Utils.safeRange})
})

router.post('/', function (req, res, next) {
	var page = req.body.page || req.query.page || 0;
	var start = req.body.start || req.query.start || new Date(2016, 01, 01).toISOString();
	var end = req.body.end || req.query.end || new Date().toISOString();
	
	var condition = {
		created: {
			'$gte': new Date(start),
			'$lte': new Date(end)
		},
		// nodeId : nodeId,
		// type : req.body.type
	}
	// console.log(req.body)
	try {
		if (req.body.range || req.query.range) {
			var range = req.body.range || req.query.range;
			var splitted = range.split(',');
			condition['$or'] = [
				{ value: { $lt: +splitted[0] } },
				{ value: { $gt: +splitted[1] } }
			];
		}
	} catch (w) {
		if (condition['$or']) delete condition['$or'];
	}
	
	if (req.body.nodeId || req.query.nodeId) condition.nodeId = req.body.nodeId || req.query.nodeId;
	if (req.body.type || req.query.type) condition.type = +req.body.type || +req.query.type;
	console.log(condition)
	// return res.json(condition);
	Data.find(condition).count(function (e, c) {
		if (e) return res.json({ success: false, msg: e.message || e });
		Data.find(condition, function (err, results) {
			if (err) return res.json({ success: false, msg: err.message || err });
			return res.json({ success: true, data: results, pages: Math.ceil(c / 20) });
		}).sort({ created: -1 }).skip(page * 20).limit(20);
	});
});

router.post('/hour', function (req, res, next) {
	var date = +req.body.date || +req.query.date || Date.now();
	// console.log(new Date(date))
	var type = +req.body.type || +req.query.type || 0;
	var dt = new Date(date);
	var start = dt.setHours(0, 0, 0, 0);
	var end = dt.setHours(23, 59, 59, 999);
	var nodeId = req.body.nodeId || req.query.nodeId;

	if (!nodeId) return res.json({ success: false, msg: "nodeId required" });
	var condition = {
		created: {
			'$gte': new Date(start),
			'$lte': new Date(end)
		},
		nodeId: nodeId,
		type: type
	}
	Data.aggregate([
		{
			$match: condition
		},
		{
			$group: {
				"_id": { $hour: "$created" },
				"date": { $first: "$created" },
				"min": { $min: "$value" },
				"max": { $max: "$value" },
				"avg": { $avg: "$value" }
			}
		},
		{
			$sort: {
				_id: 1
			}
		}
	]).allowDiskUse(true).exec(function (err, results) {
		// console.log(err, results)		
		if (err) return res.json({ success: false, msg: err.message || err });
		return res.json({ success: true, data: results });
	});
});

router.post('/daily', function (req, res, next) {
	var start = +req.body.start || +req.query.start;
	var end = Date.now();
	if (start) {
		end = +req.body.end || +req.query.end || Date.now();
	} else {
		var now = new Date();
		start = now.setDate(now.getDate() - 7);
	}
	var type = +req.body.type || +req.query.type || 0;
	var nodeId = req.body.nodeId || req.query.nodeId;
	if (!nodeId) return res.json({ success: false, msg: "nodeId required" });

	// var sensorId = req.body.sensorId || req.query.sensorId;
	var condition = {
		created: {
			'$gte': new Date(start),
			'$lte': new Date(end)
		},
		nodeId: nodeId,
		type: type
		// sensorId: sensorId
		// type: type
	}
	// console.log(type);
	Data.aggregate([
		{
			$match: condition
		},
		{
			$group: {
				"_id": { $dateToString: { format: "%Y-%m-%d", date: "$created" } },
				"date": { $first: "$created" },
				"min": { $min: "$value" },
				"max": { $max: "$value" },
				"avg": { $avg: "$value" }
			}
		},
		{
			$sort: {
				_id: 1
			}
		}
	]).allowDiskUse(true).exec(function (err, results) {
		if (err) return res.json({ success: false, msg: err.message || err });
		return res.json({ success: true, data: results });
	});
});



/*
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
*/

router.get('*', function (req, res, next) {
	// res.send('respond with a resource');
	return res.json({ success: false, msg: "Under construction" });
});

router.post('*', function (req, res, next) {
	return res.json({ success: false, msg: "Under construction" });
});

module.exports = router;
