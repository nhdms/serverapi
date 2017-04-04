var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// var Root = require('./Root');

var NodeSchema   = new Schema({
	name : String,
	description : String,
	rootId : String,
	component : {
		temp : String,
		hum : String,
		aqi : String,
	}
});

module.exports = mongoose.model('node', NodeSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;