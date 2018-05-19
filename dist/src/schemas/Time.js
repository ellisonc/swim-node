'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var mongoose = require('mongoose');

var Time = exports.Time = mongoose.model('Time', {
  age: Number,
  altAdjTime: String,
  club: String,
  course: String,
  eventID: String,
  eventSortOrder: Number,
  LSC: String,
  meetID: Number,
  meetName: String,
  personClusteredID: String,
  powerPoints: Number,
  standard: String,
  stroke: String,
  date: Date,
  time: String
});