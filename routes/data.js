var express = require('express');
var router = express.Router();
var Data = require('../models/Data');
var Utils = require('../Util/Utils');


async function getReport(start, end) {
  start = 1498867200000
  end = 1505779200000
  try {
    var x = await Data.aggregate([{
        "$match": {
          "type": {
            "$exists": true,
            "$ne": null
          },
          created: {
            '$gte': new Date(start),
            '$lte': new Date(end)
          },
        }
      },
      {
        $project: {
          value: 1,
          created: 1,
          type: 1
        }
      },
      {
        $group: {
          _id: "$type",
          min: {
            $min: "$value"
          },
          max: {
            $max: "$value"
          },
          avg: {
            $avg: "$value"
          },
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
    // console.log('a', x)
    if (!x) return []
    var avg = await Data.aggregate([{
        $match: {
          created: {
            '$gte': new Date(start),
            '$lte': new Date(end)
          },
          $or: [{
              type: 0,
              value: {
                $gte: x[0].avg
              }
            },
            {
              type: 1,
              value: {
                $gte: x[1].avg
              }
            },
            {
              type: 2,
              value: {
                $gte: x[2].avg
              }
            }
          ]
        }
      },
      {
        $group: {
          _id: "$type",
          time: {
            $first: "$created"
          },
          val: {
            $min: "$value"
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
    var conds = [
      [x[0].min, x[0].max, avg[0].val],
      [x[1].min, x[1].max, avg[1].val],
      [x[2].min, x[2].max, avg[2].val],
    ]

    // console.log(conds)
    var y = await Data.aggregate([{
        $match: {
          created: {
            '$gte': new Date(start),
            '$lte': new Date(end)
          },
          $or: [{
              type: 0,
              value: {
                $in: conds[0]
              }
            },
            {
              type: 1,
              value: {
                $in: conds[1]
              }
            },
            {
              type: 2,
              value: {
                $in: conds[2]
              }
            }
          ]
        }
      },
      {
        $group: {
          _id: {
            a: "$type",
            b: "$value"
          },
          time: {
            $first: "$created"
          },
          val: {
            $min: "$value"
          }
        }
      },
      {
        $sort: {
          "_id.a": 1
        }
      }
    ])
    return y
  } catch (e) {
    return []
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  return res.json({
    success: false,
    msg: "Under construction"
  });
});
router.get('/saferange', function (req, res, next) {
  return res.json({
    success: true,
    data: Utils.safeRange
  })
})

router.post('/', function (req, res, next) {
  var page = req.body.page || req.query.page || 0;
  var start = req.body.start || req.query.start || new Date(2016, 01, 01).toISOString();
  var end = req.body.end || req.query.end || new Date().toISOString();

  if (!req.body.nodeId && !req.query.nodeId) return res.json({
    success: false,
    msg: "NodeId is required"
  })
  var condition = {
    created: {
      '$gte': new Date(start),
      '$lte': new Date(end)
    },
    nodeId : req.body.nodeId || req.query.nodeId,
    // type : req.body.type
  }
  // console.log(req.body)
  try {
    if (req.body.range || req.query.range) {
      var range = req.body.range || req.query.range;
      var splitted = range.split(',');
      condition['$or'] = [{
          value: {
            $lt: +splitted[0]
          }
        },
        {
          value: {
            $gt: +splitted[1]
          }
        }
      ];
    }
  } catch (w) {
    if (condition['$or']) delete condition['$or'];
  }

  // if (req.body.nodeId || req.query.nodeId) condition.nodeId = req.body.nodeId || req.query.nodeId;
  if (req.body.type != null || req.query.type != null) condition.type = +req.body.type || +req.query.type || 0;
  console.log(req.body.type, condition.type)
  // return res.json(condition);
  Data.find(condition).count(function (e, c) {
    if (e) return res.json({
      success: false,
      msg: e.message || e
    });
    Data.find(condition, function (err, results) {
      if (err) return res.json({
        success: false,
        msg: err.message || err
      });
      return res.json({
        success: true,
        data: results,
        pages: Math.ceil(c / 20)
      });
    }).sort({
      created: -1
    }).skip(page * 20).limit(20);
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

  if (!nodeId) return res.json({
    success: false,
    msg: "nodeId required"
  });
  var condition = {
    created: {
      '$gte': new Date(start),
      '$lte': new Date(end)
    },
    nodeId: nodeId,
    type: type
  }
  Data.aggregate([{
      $match: condition
    },
    {
      $group: {
        "_id": {
          $hour: "$created"
        },
        "date": {
          $first: "$created"
        },
        "min": {
          $min: "$value"
        },
        "max": {
          $max: "$value"
        },
        "avg": {
          $avg: "$value"
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]).allowDiskUse(true).exec(function (err, results) {
    // console.log(err, results)		
    if (err) return res.json({
      success: false,
      msg: err.message || err
    });
    return res.json({
      success: true,
      data: results
    });
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
  if (!nodeId) return res.json({
    success: false,
    msg: "nodeId required"
  });

  // var sensorId = req.body.sensorId || req.query.sensorId;
  var condition = {
    created: {
      '$gte': new Date(start),
      '$lte': new Date(end)
    },
    nodeId: nodeId,
    type: type,
    // sensorId: sensorId
    // type: type
  }
  if (+type !== 1) {
    condition.value = {
      '$gt': 0
    }
  }
  // console.log(type);
  Data.aggregate([{
      $match: condition
    },
    {
      $group: {
        "_id": {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$created"
          }
        },
        "date": {
          $first: "$created"
        },
        "min": {
          $min: "$value"
        },
        "max": {
          $max: "$value"
        },
        "avg": {
          $avg: "$value"
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]).allowDiskUse(true).exec(function (err, results) {
    if (err) return res.json({
      success: false,
      msg: err.message || err
    });
    return res.json({
      success: true,
      data: results
    });
  });
});

router.get('/report', async function (req, res) {
  console.log('report')
  var start = +req.query.start || Date.now(),
    end = +req.query.end || new Date()

  console.log(getReport(start, end))
  return res.json({
    success: true,
    data: await getReport(start, end)
  })
})

router.get('*', function (req, res, next) {
  // res.send('respond with a resource');
  return res.json({
    success: false,
    msg: "Under construction"
  });
});

router.post('*', function (req, res, next) {
  return res.json({
    success: false,
    msg: "Under construction"
  });
});

module.exports = router;
