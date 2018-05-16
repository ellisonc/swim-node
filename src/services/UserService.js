import { Auth } from "../auth/auth";
import { User } from "../schemas/User";
const Passport = require('passport')
const md5 = require('md5')

export class UserService {
  init(app){
    app.post('/login', Auth.server.token(), Auth.server.errorHandler())

    app.post('/logout', Passport.authenticate(['bearer'], {session: false}), (req, res) => {
      req.user.token = ""
      req.user.save().then(() => {
        res.send()
      })
    })

    app.post('/users/create', (req, res) => {
      let user = new User({
        firstName: req.body.firstName,
        middleName: req.body.middleName || '',
        lastName: req.body.lastName,
        email: req.body.email,
        password: md5(req.body.password),
        birthday: new Date(req.body.birthday),
      });
      user.save(function(err, result) {
        if(err){
          res.sendStatus(500);
        } else {
          let created = result.toObject()
          delete created["password"]
          res.status(200).send(created);
        }
      })
    })

    app.get('/session', Passport.authenticate(['bearer'], {session: false}))
  }
}