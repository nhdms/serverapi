var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LocationSchema   = new Schema({
	_id:String,
    latitude: [],
    longitude: []
});

// const LocationModel = 
module.exports = mongoose.model('location_history', LocationSchema);