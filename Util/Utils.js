var Location = require('../models/Location');
var Root = require('../models/Root');
var Sensor = require('../models/Sensor');
module.exports.validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
module.exports.validPasswordMessage = "password's length must have a minimum of 8 and a maximum of 30 characters respectively";
module.exports.validatePassword = (pass) => {
    return !!pass && pass.length >= 8 && pass.length <= 30;
}

module.exports.validateLocation = (lid, cb) => {
    Location.findById(lid, (err, result) => {
        if (err) return cb(err);
        else cb(null, result);
    });
}

module.exports.getLocationById = (lid, cb) => {
    Location.findById(lid, cb);
}


module.exports.getRootById = (rid, cb) => {
    Root.findById(lid, cb);
}

module.exports.getSensorById = (sid, cb) => {
    Sensor.findById(sid, cb);
}

// {
//     validPassword : "password's length must have a minimum of 8 and a maximum of 30 characters respectively",
//     validatePassword: function(pass){
//         return pass.length >= 8 && pass.length <= 30;
//     },
//     validateEmail = function(email){
//         var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//         return re.test(email);
//     }
// }