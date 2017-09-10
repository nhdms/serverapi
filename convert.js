var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// var Node = require('./Node');

mongoose.connect('mongodb://localhost/demo');

var DataSchema   = new Schema({
}, {strict: false});

var newSchema = new Schema({
	received : {
		type : Date,
		default : Date.now
	},
	nodeId: String,
	sensorId: String,
	value: Number,
	type: Number,
	created : {
		type : Date,
		default : Date.now
	}
}, {strict: false});

DataModel = mongoose.model('data', new Schema());
NewDataModel = mongoose.model('new_data', newSchema);


var stream = DataModel.find().lean().stream();
var i = 0;
stream.on('data', function (doc) {
	doc.nodeId = "NODE_001"
	//console.log(doc)
	
	var a = new NewDataModel(doc)
	a.save((e)=> {
		if (!e) console.log(i++)
	})
	
})

stream.on('error', function (err) {
  // handle err
})

stream.on('close', function () {
  // all done
})
 