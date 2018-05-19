'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _auth = require('../auth/auth');

var _User = require('../schemas/User');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Passport = require('passport');
var md5 = require('md5');

var UserService = exports.UserService = function () {
  function UserService() {
    _classCallCheck(this, UserService);
  }

  _createClass(UserService, [{
    key: 'init',
    value: function init(app) {
      app.post('/login', _auth.Auth.server.token(), _auth.Auth.server.errorHandler());

      app.post('/logout', Passport.authenticate(['bearer'], { session: false }), function (req, res) {
        req.user.token = '';
        req.user.save().then(function () {
          res.send();
        });
      });

      app.post('/users/create', function (req, res) {
        var user = new _User.User({
          firstName: req.body.firstName,
          middleName: req.body.middleName || '',
          lastName: req.body.lastName,
          email: req.body.email,
          password: md5(req.body.password),
          birthday: new Date(req.body.birthday)
        });
        user.save(function (err, result) {
          if (err) {
            res.sendStatus(500);
          } else {
            var created = result.toObject();
            delete created['password'];
            res.status(200).send(created);
          }
        });
      });

      app.get('/user', Passport.authenticate('bearer', { session: false }), function (req, res) {
        if (req.user) {
          _User.User.findById(req.user._id).populate('swimmer').then(function (user) {
            res.status(200).send(user);
          });
        } else {
          res.sendStatus(500);
        }
      });

      app.get('/session', Passport.authenticate(['bearer'], { session: false }));
    }
  }]);

  return UserService;
}();