import {Auth} from './auth/auth'
const mongoose = require('mongoose')
import {User} from './schemas/User'
import {Swimmer} from './schemas/Swimmer'
import {Time} from './schemas/Time'
import {UserService} from './services/UserService'
const debug = require('debug')('dbg')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const Passport = require('passport')
require('dotenv').load()

console.log(!!debug)

// DB connect
mongoose.connect(process.env.DB_CONNECTION_STRING).then(() => {
  console.log('connected')
}).catch((err) => {
  console.log('error connecting db', err)
})

// Begin App
const authService = new Auth()
authService.init()
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
app.use(Passport.initialize())

app.get('/status', (req, res) => {
  res.send({
    message: 'server online'
  })
})

const userService = new UserService()
userService.init(app)

app.listen(process.env.PORT || 3000)
