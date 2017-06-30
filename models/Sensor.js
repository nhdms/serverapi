var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SensorSchema   = new Schema({
	name : String,
	type : String,
	description : String,
    nodeId : String
});

module.exports = mongoose.model('sensor', SensorSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;