'use strict';

var _auth = require('./auth/auth');

var _UserService = require('./services/UserService');

var mongoose = require('mongoose');
var debug = require('debug')('dbg');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');
var request = require('superagent');
var Passport = require('passport');
require('dotenv').load();

console.log(!!debug);

// DB connect
mongoose.connect(process.env.DB_CONNECTION_STRING).then(function () {
  console.log('connected');
}).catch(function (err) {
  console.log('error connecting db', err);
});

var agent = request.agent();
// setTimeout(runTest, 2000)
function runTest() {
  agent.get('https://www.usaswimming.org/Home/times/individual-times-search').then(function (res) {
    var index = res.text.indexOf('Usas.Times_IndividualTimes.Index.WireUpSearch');
    var sub = res.text.substr(index, 500);
    console.log(sub);
    var start = sub.indexOf("', '") + 4;
    var end = sub.indexOf("');");
    console.log(sub.slice(start, end));
    var token = sub.slice(start, end);
    console.log('token:', token);
    runSearch(token);
  }).catch(function (err) {
    console.error(err);
  });
}

function runSearch(token) {
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

function runTimes(personId, clubName, token) {
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

app.listen(process.env.PORT || 3000);