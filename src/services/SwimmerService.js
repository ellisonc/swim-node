import { Auth } from '../auth/auth'
import { User } from '../schemas/User'
import { Swimmer } from '../schemas/Swimmer'
import { Time } from '../schemas/Time'
const Passport = require('passport')
const request = require('superagent')

export class SwimmerService {
  init (app) {

    //Swimmer's times can be loaded with only name (user info)
    //Swimmer needs to select a club

    app.get('/swimmer', Passport.authenticate('bearer', {session: false}), (req, res) => {
      console.log("SWIMMER GET")
      console.log(req.user)
      let swimmerId = req.user.swimmer._id
      Swimmer.findById(swimmerId).populate('times').then(swimmer => {
        if(swimmer){
          res.status(200).send(swimmer)
        } else {
          res.sendStatus(404)
        }
      }).catch(err => {
        console.error(err)
        res.sendStatus(500)
      })
    })

    app.post('/swimmers/create', Passport.authenticate('bearer', {session: false}), (req, res) => {
      console.log("SWIMMER CREATE")
      let userId = req.user._id
      let created, token, agent
      Swimmer.findOne({user: userId}).then(result => {
        if(result){
          created = result
        } else {
          created = new Swimmer({
            times: [],
            user: userId
          })
          req.user.swimmer = created._id
          req.user.save()
          return created.save()
        }
      }).then(() => {
        agent = request.agent()
        return this.getToken(agent)
      }).then(result => {
        token = result
        return this.timesByName(agent, token, req.user)
      }).then((result) => {
        console.log(result)
        if(result.times){
          //TODO times
          return this.populateTimes(result.times, created._id)
        } else {
          created.clubOptions = result.clubs.map(club => club.ClubName)
          created.personIdOptions = result.clubs.map(club => club.PersonID)
          return created.save()
        }
      }).then((result) => {
        res.status(200).send(result)
      }).catch(err => {
        console.error(err)
        res.sendStatus(500)
      })
    })

    app.post('/swimmers/setPersonClub', Passport.authenticate('bearer', {session: false}), (req, res) => {
      console.log("SWIMMER UPDATE TIMES")
      let userId = req.user._id
      let swimmer, token
      let agent = request.agent()
      Swimmer.findOne({user: userId}).then(result => {
        swimmer = result
        swimmer.clubName = req.body.club
        swimmer.personId = req.body.personId
        return swimmer.save()
      }).then(() => {
        return this.getToken(agent)
      }).then((result) => {
        token = result
        if(swimmer.clubName && swimmer.personId){
          console.log("times by id")
          return this.timesById(agent, token, req.body.personId, req.body.club)
        } else {
          return this.timesByName(agent, token, req.user)
        }
      }).then(result => {
        console.log(result)
        if(result.times){
          return this.populateTimes(result.times, swimmer._id)
        } else {
          return Promise.resolve(swimmer)
        }
      }).then(result => {
        res.status(200).send(result)
      }).catch(err => {
        console.error(err)
        res.sendSTatus(500)
      })
    })
  }

  populateTimes(times, swimmerId) {
    let swimmer
    return Swimmer.findById(swimmerId).populate('times').then(res => {
      swimmer = res
      let existing = new Set()
      if(swimmer.times){
        swimmer.times.forEach(time => {
          existing.add("" + time.time + time.stroke + time.meetName)
        })
      }
      let newTimes = []
      times.forEach(time => {
        if(!existing.has("" + time.SwimTime + time.Stroke + time.MeetName)){
          let date = time.SwimDate.substr(6, time.SwimDate.length - 8)
          newTimes.push({
            age: time.Age,
            altAdjTime: time.AltAdjTime,
            club: time.Club,
            course: time.Course,
            eventID: time.EventID,
            eventSortOrder: time.EventSortOrder,
            LSC: time.LSC,
            meetID: time.MeetID,
            meetName: time.MeetName,
            personClusteredID: time.PersonCLusteredID,
            powerPoints: time.PowerPoints,
            standard: time.Standard,
            stroke: time.Stroke,
            date: new Date(parseInt(date)),
            time: time.SwimTime
          })
        }
      })
      return Time.insertMany(newTimes)
    }).then(results => {
      console.log("INSERTED", results)
      if(results){
        if(!swimmer.times){
          swimmer.times = []
        }
        results.forEach(result => {
          swimmer.times.push(result._id)
        })
      }
      return Promise.resolve(swimmer.save())
    }).catch(err => {
      console.log("Error populating times", err)
      return Promise.reject(err)
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

  timesByName(agent, token, user) {
    return agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForFilter')
    .set('Host', 'www.usaswimming.org')
    .set('Origin', 'https://www.usaswimming.org')
    .set('Referer', 'https://www.usaswimming.org/Home/times/individual-times-search')
    .set('RequestVerificationToken', token)
    .field('divId', 'UsasTimeSearchIndividual_Index_Div_1')
    .field('FirstName', user.firstName)
    .field('LastName', user.lastName)
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
        return Promise.resolve({
          clubs: data,
          times: undefined
        });
        //runTimes(data[1].PersonID, data[1].ClubName, token)
      } else {
        let dataStart = res.text.indexOf('data: ') + 6
        let dataEnd = res.text.indexOf('pageSize:')
        console.log(dataStart, dataEnd)
        console.log(res.text.slice(dataStart, dataEnd - 19))
        let data = JSON.parse(res.text.slice(dataStart, dataEnd - 19))
        console.log('Data', data)
        return Promise.resolve({
          clubs: undefined, 
          times: data
        })
      }
    })
  }

  timesById(agent, token, personId, clubName){
    return agent.post('https://www.usaswimming.org/Home/times/individual-times-search/ListTimesForPersonId')
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
      return Promise.resolve({times: data})
    })
  }
}
