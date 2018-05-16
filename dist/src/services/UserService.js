'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _auth = require('../auth/auth');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Passport = require('passport');

var UserService = exports.UserService = function () {
  function UserService() {
    _classCallCheck(this, UserService);
  }

  _createClass(UserService, [{
    key: 'init',
    value: function init(app) {
      app.post('/login', _auth.Auth.server.token(), _auth.Auth.server.errorHandler());

      app.post('/logout', Passport.authenticate(['bearer'], { session: false }), function (req, res) {
        req.user.token = "";
        req.user.save().then(function () {
          res.send();
        });
      });

      app.get('/session', Passport.authenticate(['bearer'], { session: false }));
    }
  }]);

  return UserService;
}();