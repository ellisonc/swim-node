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
      var _this = this;

      //Swimmer's times can be loaded with only name (user info)
      //Swimmer needs to select a club

      app.get('/swimmer', Passport.authenticate('bearer', { session: false }), function (req, res) {
        console.log("SWIMMER GET");
        console.log(req.user);
        var swimmerId = req.user.swimmer._id;
        _Swimmer.Swimmer.findById(swimmerId).populate('times').then(function (swimmer) {
          if (swimmer) {
            res.status(200).send(swimmer);
          } else {
            res.sendStatus(404);
          }
        }).catch(function (err) {
          console.error(err);
          res.sendStatus(500);
        });
      });

      app.post('/swimmers/create', Passport.authenticate('bearer', { session: false }), function (req, res) {
        console.log("SWIMMER CREATE");
        var userId = req.user._id;
        var created = void 0,
            token = void 0,
            agent = void 0;
        _Swimmer.Swimmer.findOne({ user: userId }).then(function (result) {
          if (result) {
            created = result;
          } else {
            created = new _Swimmer.Swimmer({
              times: [],
              user: userId
            });
            return created.save();
          }
        }).then(function () {
          agent = request.agent();
          return _this.getToken(agent);
        }).then(function (result) {
          token = result;
          return _this.timesByName(agent, token, req.user);
        }).then(function (result) {
          console.log(result);
          if (result.times) {
            //TODO times
            return _this.populateTimes(result.times, created._id);
          } else {
            created.clubOptions = result.clubs.map(function (club) {
              return club.ClubName;
            });
            created.personIdOptions = result.clubs.map(function (club) {
              return club.PersonID;
            });
            return created.save();
          }
        }).then(function (result) {
          res.status(200).send(result);
        }).catch(function (err) {
          console.error(err);
          res.sendStatus(500);
        });
      });

      app.post('/swimmers/setPersonClub', Passport.authenticate('bearer', { session: false }), function (req, res) {
        console.log("SWIMMER UPDATE TIMES");
        var userId = req.user._id;
        var swimmer = void 0,
            token = void 0;
        var agent = request.agent();
        _Swimmer.Swimmer.findOne({ user: userId }).then(function (result) {
          swimmer = result;
          swimmer.clubName = req.body.club;
          swimmer.personId = req.body.personId;
          return swimmer.save();
        }).then(function () {
          return _this.getToken(agent);
        }).then(function (result) {
          token = result;
          if (swimmer.clubName && swimmer.personId) {
            console.log("times by id");
            return _this.timesById(agent, token, req.body.personId, req.body.club);
          } else {
            return _this.timesByName(agent, token, req.user);
          }
        }).then(function (result) {
          console.log(result);
          if (result.times) {
            return _this.populateTimes(result.times, swimmer._id);
          } else {
            return Promise.resolve(swimmer);
          }
        }).then(function (result) {
          res.status(200).send(result);
        }).catch(function (err) {
          console.error(err);
          res.sendSTatus(500);
        });
      });
    }
  }, {
    key: 'populateTimes',
    value: function populateTimes(times, swimmerId) {
      var swimmer = void 0;
      return _Swimmer.Swimmer.findById(swimmerId).populate('times').then(function (res) {
        swimmer = res;
        var existing = new Set();
        if (swimmer.times) {
          swimmer.times.forEach(function (time) {
            existing.add("" + time.time + time.stroke + time.meetName);
          });
        }
        var newTimes = [];
        times.forEach(function (time) {
          if (!existing.has("" + time.SwimTime + time.Stroke + time.MeetName)) {
            var date = time.SwimDate.substr(6, time.SwimDate.length - 8);
            newTimes.push({
              age: time.Age,
              altAdjTime: time.AltAdjTime,
              club: time.Club,
              course: time.Course,
              eventID: time.EventID,
              eventSortOrder: time.EventSortOrder,
              LSC: time.LSC,
              meetID: time.MeetID,
              meetName: time.MeetName,
              personClusteredID: time.PersonCLusteredID,
              powerPoints: time.PowerPoints,
              standard: time.Standard,
              stroke: time.Stroke,
              date: new Date(parseInt(date)),
              time: time.SwimTime
            });
          }
        });
        return _Time.Time.insertMany(newTimes);
      }).then(function (results) {
        console.log("INSERTED", results);
        if (results) {
          if (!swimmer.times) {
            swimmer.times = [];
          }
          results.forEach(function (result) {
            swimmer.times.push(result._id);
          });
        }
        return Promise.resolve(swimmer.save());
      }).catch(function (err) {
        console.log("Error populating times", err);
        return Promise.reject(err);
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
    value: function timesByName(agent, token, user) {
      return agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForFilter').set('Host', 'www.usaswimming.org').set('Origin', 'https://www.usaswimming.org').set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search').set('RequestVerificationToken', token).field('divId', 'UsasTimeSearchIndividual_Index_Div_1').field('FirstName', user.firstName).field('LastName', user.lastName).field('SelectedDateType', 'DateRange').field('StartDate', '').field('EndDate', '').field('DateRangeID', -1).field('SelectedEventType', 'All').field('DSC[DistanceID]', 0).field('DSC[StrokeID]', 0).field('DSC[CourseID]', 0).field('SelectedAgeFilter', 'All').field('StartAge', 'All').field('EndAge', 'All').field('OrderBy', 'SwimDate').then(function (res) {
        console.log(res);
        if (res.text.includes('We found more than one person that matched the name you provided')) {
          console.log('Find Clubs');
          var dataStart = res.text.indexOf('data: ') + 6;
          var dataEnd = res.text.indexOf('schema:');
          console.log(dataStart, dataEnd);
          console.log(res.text.slice(dataStart, dataEnd - 19));
          var data = JSON.parse(res.text.slice(dataStart, dataEnd - 19));
          console.log('data', data);
          return Promise.resolve({
            clubs: data,
            times: undefined
          });
          //runTimes(data[1].PersonID, data[1].ClubName, token)
        } else {
          var _dataStart = res.text.indexOf('data: ') + 6;
          var _dataEnd = res.text.indexOf('pageSize:');
          console.log(_dataStart, _dataEnd);
          console.log(res.text.slice(_dataStart, _dataEnd - 19));
          var _data = JSON.parse(res.text.slice(_dataStart, _dataEnd - 19));
          console.log('Data', _data);
          return Promise.resolve({
            clubs: undefined,
            times: _data
          });
        }
      });
    }
  }, {
    key: 'timesById',
    value: function timesById(agent, token, personId, clubName) {
      return agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForPersonId').set('Host', 'www.usaswimming.org').set('Origin', 'https://www.usaswimming.org').set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search').set('RequestVerificationToken', token).field('divId', 'UsasTimeSearchIndividual_Index_Div_1').field('PersonID', personId).field('ClubName', clubName).field('SponsorImage', '').field('SponsorWebsite', '').field('FirstName', 'Andrew').field('LastName', 'Ellison').field('SelectedDateType', 'DateRange').field('StartDate', '').field('EndDate', '').field('DateRangeID', -1).field('SelectedEventType', 'All').field('DSC[DistanceID]', 0).field('DSC[StrokeID]', 0).field('DSC[CourseID]', 0).field('SelectedAgeFilter', 'All').field('StartAge', 'All').field('EndAge', 'All').field('OrderBy', 'SwimDate').then(function (res) {
        console.log(res);
        var dataStart = res.text.indexOf('data: ') + 6;
        var dataEnd = res.text.indexOf('pageSize:');
        console.log(dataStart, dataEnd);
        console.log(res.text.slice(dataStart, dataEnd - 19));
        var data = JSON.parse(res.text.slice(dataStart, dataEnd - 19));
        console.log('Data', data);
        return Promise.resolve({ times: data });
      });
    }
  }]);

  return SwimmerService;
}();