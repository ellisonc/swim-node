const mongoose = require('mongoose')
const Schema = mongoose.Schema

export const Swimmer = mongoose.model('Swimmer', {
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  times: [{type: Schema.Types.ObjectId, ref: 'Time'}],
  usasId: String,
  clubName: String,
  personId: String,
  personIdOptions: [String],
  clubOptions: [String],
  LscId: String
})
