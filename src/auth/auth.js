import { User } from '../schemas/User'
const Passport = require('passport')
const Bearer = require('passport-http-bearer')
const OAuth2orize = require('oauth2orize')
const uuidV4 = require('uuid/v4')
const server = OAuth2orize.createServer()
const md5 = require('md5')

export class Auth {
  init () {
    Passport.use(new Bearer.Strategy((token, done) => {
      User.findOne({token: token}).then(user => {
        done(null, user, null)
      }).catch(err => {
        console.error(err)
        done(err, null, null)
      })
    }))

    server.exchange(OAuth2orize.exchange.password((user, username, password, scope, done) => {
      User.findOne({
        email: username,
        password: md5(password)
      }).then(user => {
        if (!user) {
          done(new Error('Forbidden'))
        } else if (user.token) {
          done(null, user.token, null, {user: user})
        } else {
          let token = uuidV4()
          user.token = token
          user.save().then(() => {
            done(null, token, null, {user: user})
          })
        }
      }).catch(err => {
        done(err)
      })
    }))
  }

  static get server () {
    return server
  }
}
