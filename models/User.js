
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        unique: true,
        required: true
    },
    name: String,
    phone: String,
    email: String,
    roles: [String],
    fcm_token: String,
    owner_nodeIds: [{
        type: String,
        ref: 'Node'
    }]
});

UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.genSalt(10, (err, salt) => {
        // console.log(err, salt);
        // console.log(err);
        if (err) return next(err);
        // console.log(user)
        bcrypt.hash(user.password, salt, (e, h) => {
            // console.log(h);
            if (e) return next(e);
            user.password = h;
            user.roles = ['user'];
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

module.exports = mongoose.model('User', UserSchema);