'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Swimmer = exports.Swimmer = mongoose.model('Swimmer', {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  times: [{ type: Schema.Types.ObjectId, ref: 'Time' }],
  usasId: String,
  clubName: String,
  LscId: String
})
