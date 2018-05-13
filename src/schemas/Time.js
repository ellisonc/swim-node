import mongoose from 'mongoose'
const Schema = mongoose.Schema

export const Time = mongoose.model('Time', {
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
})