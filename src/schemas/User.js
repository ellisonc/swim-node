const mongoose = require('mongoose')
const Schema = mongoose.Schema

export const User = mongoose.model('User', {
  firstName: String,
  middleName: String,
  lastName: String,

  email: String,
  password: {
    type: String, select: false
  },
  token: String,

  birthday: Date,
  swimmer: {type: Schema.Types.ObjectId, ref: 'Swimmer'}
})
