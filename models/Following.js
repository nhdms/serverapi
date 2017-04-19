var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// var Node = require('./Node');
var FollowingSchema   = new Schema({
	created : {
		type : Date,
		default : Date.now
	},
	uid : String,
	deviceId : String
});

module.exports = mongoose.model('following', FollowingSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;