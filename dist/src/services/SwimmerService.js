'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SwimmerService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _auth = require('../auth/auth');

var _User = require('../schemas/User');

var _Swimmer = require('../schemas/Swimmer');

var _Time = require('../schemas/Time');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Passport = require('passport');
var request = require('superagent');

var SwimmerService = exports.SwimmerService = function () {
  function SwimmerService() {
    _classCallCheck(this, SwimmerService);
  }

  _createClass(SwimmerService, [{
    key: 'init',
    value: function init(app) {
      app.post('/swimmer/create', Passport.authenticate('bearer', { session: false }), function (req, res) {
        var userId = req.user._id;
        var swimmer = new _Swimmer.Swimmer({
          usasId: req.body.usasId,
          clubName: req.body.clubName,
          LscId: req.body.lscId,
          times: [],
          user: userId
        });
        swimmer.save().then(function (created) {
          res.status(200).send(created);
        }).catch(function (err) {
          console.error(err);
          res.sendStatus(500);
        });
      });

      app.put('/swimmer/initTimes', Passport.authenticate('bearer', { session: false }), function (req, res) {
        var agent = request.agent();
        _Swimmer.Swimmer.findById(req.user.swimmer).then(function (swimmer) {}).catch(function (err) {
          console.error(err);
          res.sendStatus(500);
        });
      });
    }
  }, {
    key: 'getToken',
    value: function getToken(agent) {
      return agent.get('https://www.usaswimming.org/Home/times/individual-times-search').then(function (res) {
        var index = res.text.indexOf('Usas.Times_IndividualTimes.Index.WireUpSearch');
        var sub = res.text.substr(index, 500);
        console.log(sub);
        var start = sub.indexOf("', '") + 4;
        var end = sub.indexOf("');");
        console.log(sub.slice(start, end));
        var token = sub.slice(start, end);
        console.log('token:', token);
        return Promise.resolve(token);
      }).catch(function (err) {
        console.error(err);
        return Promise.reject(err);
      });
    }
  }, {
    key: 'timesByName',
    value: function timesByName(agent, token) {
      agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForFilter').set('Host', 'www.usaswimming.org').set('Origin', 'https://www.usaswimming.org').set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search').set('RequestVerificationToken', token).field('divId', 'UsasTimeSearchIndividual_Index_Div_1').field('FirstName', 'Andrew').field('LastName', 'Ellison').field('SelectedDateType', 'DateRange').field('StartDate', '').field('EndDate', '').field('DateRangeID', -1).field('SelectedEventType', 'All').field('DSC[DistanceID]', 0).field('DSC[StrokeID]', 0).field('DSC[CourseID]', 0).field('SelectedAgeFilter', 'All').field('StartAge', 'All').field('EndAge', 'All').field('OrderBy', 'SwimDate').then(function (res) {
        console.log(res);
        if (res.text.includes('We found more than one person that matched the name you provided')) {
          console.log('Find Clubs');
          var dataStart = res.text.indexOf('data: ') + 6;
          var dataEnd = res.text.indexOf('schema:');
          console.log(dataStart, dataEnd);
          console.log(res.text.slice(dataStart, dataEnd - 19));
          var data = JSON.parse(res.text.slice(dataStart, dataEnd - 19));
          console.log('data', data);
          runTimes(data[1].PersonID, data[1].ClubName, token);
        } else {
          console.log('We have the data?');
        }
      });
    }
  }, {
    key: 'timesById',
    value: function timesById(agent, token, personId, clubName) {
      agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForPersonId').set('Host', 'www.usaswimming.org').set('Origin', 'https://www.usaswimming.org').set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search').set('RequestVerificationToken', token).field('divId', 'UsasTimeSearchIndividual_Index_Div_1').field('PersonID', personId).field('ClubName', clubName).field('SponsorImage', '').field('SponsorWebsite', '').field('FirstName', 'Andrew').field('LastName', 'Ellison').field('SelectedDateType', 'DateRange').field('StartDate', '').field('EndDate', '').field('DateRangeID', -1).field('SelectedEventType', 'All').field('DSC[DistanceID]', 0).field('DSC[StrokeID]', 0).field('DSC[CourseID]', 0).field('SelectedAgeFilter', 'All').field('StartAge', 'All').field('EndAge', 'All').field('OrderBy', 'SwimDate').then(function (res) {
        console.log(res);
        var dataStart = res.text.indexOf('data: ') + 6;
        var dataEnd = res.text.indexOf('pageSize:');
        console.log(dataStart, dataEnd);
        console.log(res.text.slice(dataStart, dataEnd - 19));
        var data = JSON.parse(res.text.slice(dataStart, dataEnd - 19));
        console.log('Data', data);
      });
    }
  }]);

  return SwimmerService;
}();