const mongoose = require('mongoose')
const Schema = mongoose.Schema

export const User = mongoose.model('User', {
  firstName: String,
  middleName: String,
  lastName: String,

  username: String,
  email: String,
  password: String,

  birthday: Date,
  swimmer: {type: Schema.Types.ObjectId, ref: 'Swimmer'}
})
