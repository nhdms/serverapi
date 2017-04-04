var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LocationSchema   = new Schema({
	name : String,
	address : String,
	coordinate : {
		longtitude : Number,
		latitude : Number
	}
});

module.exports = mongoose.model('location', LocationSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;