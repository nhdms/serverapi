var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// var Node = require('./Node');
var DataSchema   = new Schema({
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

module.exports = mongoose.model('data', DataSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;