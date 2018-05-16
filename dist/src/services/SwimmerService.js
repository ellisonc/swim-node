'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.SwimmerService = undefined

var _createClass = (function () { function defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor) } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor } }())

var _auth = require('../auth/auth')

var _Swimmer = require('../schemas/Swimmer')

var _Time = require('../schemas/Time')

function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

var Passport = require('passport')

var SwimmerService = exports.SwimmerService = (function () {
  function SwimmerService () {
    _classCallCheck(this, SwimmerService)
  }

  _createClass(SwimmerService, [{
    key: 'init',
    value: function init (app) {
      app.get('/swimmer', Passport.authenticate(['bearer'], { session: false }), function (req, res) {
        if (req.user && req.user.swimmer) {} else {
          res.sendStatus(500)
        }
      })
    }
  }])

  return SwimmerService
}())
