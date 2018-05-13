import { Auth } from "../auth/auth";
const Passport = require('passport')

export class UserService {
  init(app){
    app.post('/login', Auth.server.token(), Auth.server.errorHandler())

    app.post('/logout', Passport.authenticate(['bearer'], {session: false}), (req, res) => {
      req.user.token = ""
      req.user.save().then(() => {
        res.send()
      })
    })

    app.get('/session', Passport.authenticate(['bearer'], {session: false}))
  }
}