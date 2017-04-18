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

// const LocationModel = 

LocationSchema.pre('save', function(next) {
    // console.log('evv');
    var loc = this;
    // // if (loc.coordinate.longtitude)
    LocationModel = mongoose.model('location', LocationSchema);
    
    LocationModel.find({"coordinate.longtitude" : loc.coordinate.longtitude, "coordinate.latitude" : loc.coordinate.latitude}, (err, docs) => {
        console.log(err, docs);
        if (!docs.length){
            next();
        }else{                
            // console.log('user exists: ');
            next(new Error("Location exists!"));
        }
    })
    // return next(new Error("DSGG"))
});

module.exports = mongoose.model('location', LocationSchema);;
    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;