'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = exports.User = mongoose.model('User', {
  firstName: String,
  middleName: String,
  lastName: String,

  email: String,
  password: {
    type: String, select: false
  },
  token: String,

  birthday: Date,
  swimmer: { type: Schema.Types.ObjectId, ref: 'Swimmer' }
});