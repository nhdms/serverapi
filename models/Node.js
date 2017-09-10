var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Root = require('./Root');
var NodeSchema = new Schema({
	_id: String,
	name: String,
	description: String,
	rootId: String,
	chipId: String,
	lid: String
});

NodeSchema.methods.findByIds = (ids, cb) => {
	// console.log(ids.constructor)
	if (Array != ids.constructor) cb("Argument 1 must be an array");
	var NodeModel = mongoose.model('node', NodeSchema);
	NodeModel.find({
		"_id": {
			$in: ids
		}
	}, cb);
}

module.exports = mongoose.model('node', NodeSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;