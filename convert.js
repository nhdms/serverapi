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
mongoose.connect('mongodb://203.162.131.246/demo?authSource=admin', { useMongoClient: true, user: 'sya2', pass: 'seeyourairptit' }, (e) => {
  console.log(e)
});

var Kitten = mongoose.model('datax', new Schema());

var a = new Kitten({a : 1})
a.save(console.log)