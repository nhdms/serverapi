var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Node = require('./Node');
var FollowingSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    uid: String,
    nodeId: String
});

module.exports = mongoose.model('following', FollowingSchema);
