var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// var Node = require('./Node');
var DataSchema   = new Schema({
	created : {
		type : Date,
		default : Date.now
	},
	value : {
		temp: Number,
		hum: Number,
		aqi: Number
	},
	nid : String
}, {strict: false});

module.exports = mongoose.model('data', DataSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;