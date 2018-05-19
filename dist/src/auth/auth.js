'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Auth = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _User = require('../schemas/User');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Passport = require('passport');
var Bearer = require('passport-http-bearer');
var OAuth2orize = require('oauth2orize');
var uuidV4 = require('uuid/v4');
var server = OAuth2orize.createServer();
var md5 = require('md5');

var Auth = exports.Auth = function () {
  function Auth() {
    _classCallCheck(this, Auth);
  }

  _createClass(Auth, [{
    key: 'init',
    value: function init() {
      Passport.use(new Bearer.Strategy(function (token, done) {
        _User.User.findOne({ token: token }).then(function (user) {
          done(null, user, null);
        }).catch(function (err) {
          console.error(err);
          done(err, null, null);
        });
      }));

      server.exchange(OAuth2orize.exchange.password(function (user, username, password, scope, done) {
        _User.User.findOne({
          email: username,
          password: md5(password)
        }).then(function (user) {
          if (!user) {
            done(new Error('Forbidden'));
          } else if (user.token) {
            done(null, user.token, null, { user: user });
          } else {
            var token = uuidV4();
            user.token = token;
            user.save().then(function () {
              done(null, token, null, { user: user });
            });
          }
        }).catch(function (err) {
          done(err);
        });
      }));
    }
  }], [{
    key: 'server',
    get: function get() {
      return server;
    }
  }]);

  return Auth;
}();