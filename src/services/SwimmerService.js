import { Auth } from '../auth/auth'
import { User } from '../schemas/User'
import { Swimmer } from '../schemas/Swimmer'
import { Time } from '../schemas/Time'
const Passport = require('passport')
const request = require('superagent')

export class SwimmerService {
  init (app) {
    app.post('/swimmer/create', Passport.authenticate('bearer', {session: false}), (req, res) => {
      let userId = req.user._id;
      let swimmer = new Swimmer({
        usasId: req.body.usasId,
        clubName: req.body.clubName,
        LscId: req.body.lscId,
        times: [],
        user: userId
      })
      swimmer.save().then(created => {
        res.status(200).send(created)
      }).catch(err => {
        console.error(err)
        res.sendStatus(500)
      })
    })


    app.put('/swimmer/initTimes', Passport.authenticate('bearer', {session: false}), (req, res) => {
      let agent = request.agent()
      Swimmer.findById(req.user.swimmer).then(swimmer => {
        
      }).catch(err => {
        console.error(err);
        res.sendStatus(500)
      })
    })
  }

  getToken(agent) {
    return agent.get('https://www.usaswimming.org/Home/times/individual-times-search').then(res => {
      let index = res.text.indexOf('Usas.Times_IndividualTimes.Index.WireUpSearch')
      let sub = res.text.substr(index, 500)
      console.log(sub)
      let start = sub.indexOf("', '") + 4
      let end = sub.indexOf("');")
      console.log(sub.slice(start, end))
      let token = sub.slice(start, end)
      console.log('token:', token)
      return Promise.resolve(token)
    }).catch(err => {
      console.error(err)
      return Promise.reject(err)
    })
  }

  timesByName(agent, token) {
    agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForFilter')
    .set('Host', 'www.usaswimming.org')
    .set('Origin', 'https://www.usaswimming.org')
    .set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search')
    .set('RequestVerificationToken', token)
    .field('divId', 'UsasTimeSearchIndividual_Index_Div_1')
    .field('FirstName', 'Andrew')
    .field('LastName', 'Ellison')
    .field('SelectedDateType', 'DateRange')
    .field('StartDate', '')
    .field('EndDate', '')
    .field('DateRangeID', -1)
    .field('SelectedEventType', 'All')
    .field('DSC[DistanceID]', 0)
    .field('DSC[StrokeID]', 0)
    .field('DSC[CourseID]', 0)
    .field('SelectedAgeFilter', 'All')
    .field('StartAge', 'All')
    .field('EndAge', 'All')
    .field('OrderBy', 'SwimDate')
    .then(res => {
      console.log(res)
      if (res.text.includes('We found more than one person that matched the name you provided')) {
        console.log('Find Clubs')
        let dataStart = res.text.indexOf('data: ') + 6
        let dataEnd = res.text.indexOf('schema:')
        console.log(dataStart, dataEnd)
        console.log(res.text.slice(dataStart, dataEnd - 19))
        let data = JSON.parse(res.text.slice(dataStart, dataEnd - 19))
        console.log('data', data)
        runTimes(data[1].PersonID, data[1].ClubName, token)
      } else {
        console.log('We have the data?')
      }
    })
  }

  timesById(agent, token, personId, clubName){
    agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForPersonId')
    .set('Host', 'www.usaswimming.org')
    .set('Origin', 'https://www.usaswimming.org')
    .set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search')
    .set('RequestVerificationToken', token)
    .field('divId', 'UsasTimeSearchIndividual_Index_Div_1')
    .field('PersonID', personId)
    .field('ClubName', clubName)
    .field('SponsorImage', '')
    .field('SponsorWebsite', '')
    .field('FirstName', 'Andrew')
    .field('LastName', 'Ellison')
    .field('SelectedDateType', 'DateRange')
    .field('StartDate', '')
    .field('EndDate', '')
    .field('DateRangeID', -1)
    .field('SelectedEventType', 'All')
    .field('DSC[DistanceID]', 0)
    .field('DSC[StrokeID]', 0)
    .field('DSC[CourseID]', 0)
    .field('SelectedAgeFilter', 'All')
    .field('StartAge', 'All')
    .field('EndAge', 'All')
    .field('OrderBy', 'SwimDate')
    .then(res => {
      console.log(res)
      let dataStart = res.text.indexOf('data: ') + 6
      let dataEnd = res.text.indexOf('pageSize:')
      console.log(dataStart, dataEnd)
      console.log(res.text.slice(dataStart, dataEnd - 19))
      let data = JSON.parse(res.text.slice(dataStart, dataEnd - 19))
      console.log('Data', data)
    })
  }
}
