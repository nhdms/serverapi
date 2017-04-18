var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Location = require('./Location');
var RootSchema   = new Schema({
    name: String,
    description : String,
    locationId : String
    // location : [{lid: mongoose.Schema.Types.ObjectId, ref: 'Location'}]
});

module.exports = mongoose.model('root', RootSchema);