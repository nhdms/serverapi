var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Utils = require('../Util/Utils');
var jwt = require('jsonwebtoken');
// var config = require('../config/token');

// console.log(app);
/* GET users listing. */
router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  // console.log(req.app)
  res.json({ message: "nothing here", success: false });
});


router.post('/login', (req, res, next) => {
  var username = req.body.username || req.body.email || "";
  var password = req.body.password || "";
  if ("" == username || "" == password) return res.json({ success: false, msg: "User or password is required" });
  User.findOne({
    $or: [
      { username: username },
      { email: username }
    ]
  }, (err, user) => {
    if (err) return res.json(err);
    if (!user) {
      return res.json({ success: false, msg: "Authentication failed. User not found!" });
    } else {
      // console.log(password)
      user.comparePassword(password, (err, isMatch) => {
        // console.log(err, isMatch)
        if (isMatch && !err) {
          var token = jwt.sign(user._doc, req.app.get('superSecret'));
          // req.
          var info = user._doc;
          delete info.password;
          delete info.__v;
          res.json({ success: true, token: token, info : info });
        } else {
          res.json({ success: false, msg: "Authentication failed. Wrong password" })
        }
      })
    }
  });
});


router.post('/register', (req, res, next) => {
  var { username, password, email } = req.body;
  if (!!!username) return res.json({ success: false, msg: "User is required" });
  else if (!!!password) return res.json({ success: false, msg: "Password is required" });
  else if (!Utils.validatePassword(password)) return res.json({success:false, msg : Utils.validPasswordMessage});
  else if (!!!email) return res.json({ success: false, msg: "Email is required" });
  else if (!Utils.validateEmail(email)) return res.json({ success: false, msg: "Email is not valid" });
  else {
    User.find({ $or: [{ username: username }, { email: email }] }, (err, result) => {
      // console.log(err, result);
      if (err) return res.json({ success: false, error: err, msg: err.message || err });
      if (result.length > 0) {
        if (username == result[0].username) return res.json({ success: false, msg: "Username already exists" });
        if (email == result[0].email) return res.json({ success: false, msg: "Email already exists" });
        else {
          return res.json({ success: false, msg: "User already exists" });
        }
      } else {
        var newUser = new User(req.body);
        // newUser.s
        newUser.save((err, r) => {
          // console.log(err, r)
          if (err) return res.json({ success: false, msg: err });
          res.json({ success: true, msg: "Successful created new user." });
        });
      }
    });
  }
});


module.exports = router;
