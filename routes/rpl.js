const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { Padavan } = require('../mongoModels')
const { sendRequest, addZero } = require('../functions')
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

var dates = {
   convert: function (d) {
      // Converts the date in d to a date-object. The input can be:
      //   a date object: returned without modification
      //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
      //   a number     : Interpreted as number of milliseconds
      //                  since 1 Jan 1970 (a timestamp)
      //   a string     : Any format supported by the javascript engine, like
      //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
      //  an object     : Interpreted as an object with year, month and date
      //                  attributes.  **NOTE** month is 0-11.
      return d.constructor === Date
         ? d
         : d.constructor === Array
         ? new Date(d[0], d[1], d[2])
         : d.constructor === Number
         ? new Date(d)
         : d.constructor === String
         ? new Date(d)
         : typeof d === 'object'
         ? new Date(d.year, d.month, d.date)
         : NaN
   },
   compare: function (a, b) {
      // Compare two dates (could be of any type supported by the convert
      // function above) and returns:
      //  -1 : if a < b
      //   0 : if a = b
      //   1 : if a > b
      // NaN : if a or b is an illegal date
      // NOTE: The code inside isFinite does an assignment (=).
      return isFinite((a = this.convert(a).valueOf())) && isFinite((b = this.convert(b).valueOf()))
         ? (a > b) - (a < b)
         : NaN
   },
   inRange: function (d, start, end) {
      // Checks if date in d is between dates in start and end.
      // Returns a boolean or NaN:
      //    true  : if d is between start and end (inclusive)
      //    false : if d is before start or after end
      //    NaN   : if one or more of the dates is illegal.
      // NOTE: The code inside isFinite does an assignment (=).
      return isFinite((d = this.convert(d).valueOf())) &&
         isFinite((start = this.convert(start).valueOf())) &&
         isFinite((end = this.convert(end).valueOf()))
         ? start <= d && d <= end
         : NaN
   },
}

router.get('/', async (req, res) => {
   let url = 'https://sportscore1.p.rapidapi.com/seasons/8958/events'
   let body = {
      page: '1',
   }
   sendRequest('get', url).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
         let dateOfMatch = new Date(Date.parse(res.data[i].start_at))
         let dateNow = new Date()
         let start = `${dateNow.getFullYear()}/${dateNow.getMonth() + 1}/${dateNow.getDate()}`
         let end = `${dateNow.getFullYear()}/${dateNow.getMonth() + 1}/${dateNow.getDate() + 5}`
         const gameHour = dateOfMatch.getHours() + 3
         const gameMinutes = addZero(dateOfMatch.getMinutes())
         const gameDay = addZero(dateOfMatch.getDate())
         const gameMonth = addZero(dateOfMatch.getMonth())
         const gameYear = dateOfMatch.getFullYear()
         const homeTeam = res.data[i].home_team.name_translations.ru
         const awayTeam = res.data[i].away_team.name_translations.ru

         if (dates.inRange(dateOfMatch, start, end)) {
            console.log(`${gameDay}.${gameMonth}.${gameYear}`)
            console.log('=====================')
            console.log(homeTeam + ' - ' + awayTeam)
            console.log('Начало в ' + gameHour + ':' + gameMinutes)

            console.log()
         }
      }
   })

   // res.redirect(url)
})

router.post('/', async (req, res) => {
   console.log(req.body)
   res.setHeader('Access-Control-Allow-Origin', '*')
   res.setHeader('Content-Type', 'text/html; charset=UTF-8')
   res.end('I got it')
})

// const formidableMiddleware = require('express-formidable')
// router.use(formidableMiddleware())
module.exports = router
