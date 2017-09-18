var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Node = require('./Node');
var options = {
  db: { native_parser: true },
  server: { poolSize: 5 },
  replset: { rs_name: 'myReplicaSetName' },
  user: 'sya',
  pass: '@12345679',
  promiseLibrary: global.Promise
}
mongoose.connect('mongodb://sya2:seeyourairptit@127.0.0.1/demo?authSource=admin', { uri_decode_auth: true }, console.log);

var Kitten = mongoose.model('data', new Schema());

// Kitten.find().exec(console.log)
async function test(params) {
  var x = await Kitten.aggregate([
    {
      "$match": {
        "type": { "$exists": true, "$ne": null }
      }
    },
    {
      $project:
      {
        value: 1,
        created: 1,
        type: 1
      }
    },
    {
      $group: {
        _id: "$type",
        min: { $min: "$value" },
        max: { $max: "$value" },
        avg: { $avg: "$value" },
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ])

  var avg = await Kitten.aggregate([
    {
      $match: {
        $or: [
          { type: 0, value: { $gte: x[0].avg } },
          { type: 1, value: { $gte: x[1].avg } },
          { type: 2, value: { $gte: x[2].avg } }
        ]
      }
    },
    {
      $group: {
        _id: "$type",
        time: { $first: "$created" },
        val: { $min: "$value" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  var conds = [
    [x[0].min, x[0].max, avg[0].val],
    [x[1].min, x[1].max, avg[1].val],
    [x[2].min, x[2].max, avg[2].val],
    ]
  var y = await Kitten.aggregate([
    {
      $match: {
        $or: [
          { type: 0, value: { $in: conds[0] } },
          { type: 1, value: { $in: conds[1] } },
          { type: 2, value: { $in: conds[2] } }
        ]
      }
    },
    {
      $group: {
        _id: { a: "$type", b: "$value" },
        time: { $first: "$created" },
        val: { $min: "$value" }
      }
    },
    {
      $sort: {"_id.a" : 1}
    }
  ])
  return y
}

test()