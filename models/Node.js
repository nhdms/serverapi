var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Data = require('./Data');
var NodeSchema = new Schema({
	_id: String,
	name: String,
	description: String,
	rootId: String,
	chipId: String,
	lid: String
});

NodeSchema.post('find', (err, doc, next) => {
	console.log(doc)
        next()
})

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

NodeSchema.methods.findDetail = async (id) => {
  a = await Data.find({nodeId:id}).sort({created: -1}).limit(1).lean()
var NodeModel = mongoose.model('node', NodeSchema);
  b = await NodeModel.findById(id)
 return Object.assign(a, b)
}

module.exports = mongoose.model('node', NodeSchema);

    // public String email;
    // public String password;
    // public String name;
    // public String address;
    // public String phone;
    // public boolean isManager;
