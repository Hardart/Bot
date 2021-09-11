const { Coach, Padavan, Test } = require('./mongoModels')
const Markup = require('node-vk-bot-api/lib/markup')

function collectButtons(collection, user, i) {
   switch (collection) {
      case Coach:
         return Markup.button(user.full_name, 'primary', user.coach_id)
         break
      case Padavan:
         return Markup.button(user.ren_login, 'primary', {
            button: user.ren_login,
            id: i,
         })
         break
      case Test:
         return Markup.button(user.prefix + '_' + user.title, 'primary', user._id)
         break

      default:
         break
   }
}

async function buttonsAndArray(collection) {
   const users = await collection.find()
   let buttons = []
   let i = 0
   users.forEach((user) => {
      buttons.push(collectButtons(collection, user, i))
      i++
   })
   return [buttons, users]
}

async function add(collection = 'coaches', ...args) {
   switch (collection) {
      case 'coaches':
         const coaches = await Coach.find()
         const coach = new Coach({
            vk_id: args[1],
            full_name: args[0],
            coach_id: coaches.length + 1,
         })
         await coach.save()
         break
      case 'padavans':
         const padavan = new Padavan({
            vk_id: args[0],
            full_name: args[1],
            ren_login: args[2],
            ren_pass: 'Pass',
            w_code: 'Code',
            coach_id: args[3],
         })
         await padavan.save()
         break
      case 'tests':
         const test = new Test({
            title: args[0],
            prefix: args[1],
            points: args[2],
         })
         await test.save()
         break
      default:
         break
   }
}

async function change(collection, filter_obj, updateParams_obj) {
   let params = {
      $set: updateParams_obj,
   }
   await collection.updateOne(filter_obj, params)
}

function sendToCoach(coach, ren_login, table = 'padavans') {
   connect.query(`UPDATE ${table} SET coach = ? WHERE ren_login = ?`, [coach, ren_login])
}

function reset(ren_login) {
   connect.query(`UPDATE padavans SET test_points = 0 WHERE ren_login = ?`, [ren_login])
}

module.exports = {
   selectAll: buttonsAndArray,
   add: add,
   change: change,
   resetPoints: reset,
   sendToCoach: sendToCoach,
}
