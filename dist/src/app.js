'use strict';

var _auth = require('./auth/auth');

var _User = require('./schemas/User');

var _Swimmer = require('./schemas/Swimmer');

var _Time = require('./schemas/Time');

var _UserService = require('./services/UserService');

var mongoose = require('mongoose');

var debug = require('debug')('dbg');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');
var Passport = require('passport');
require('dotenv').load();

console.log(!!debug);

// DB connect
mongoose.connect(process.env.DB_CONNECTION_STRING).then(function () {
  console.log('connected');
}).catch(function (err) {
  console.log('error connecting db', err);
});

// Begin App
var authService = new _auth.Auth();
authService.init();
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.use(Passport.initialize());

app.get('/status', function (req, res) {
  res.send({
    message: 'server online'
  });
});

var userService = new _UserService.UserService();
userService.init(app);

app.listen(process.env.PORT || 4200);