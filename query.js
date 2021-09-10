const { Coach, Padavan } = require('./mongoModels')
const Markup = require('node-vk-bot-api/lib/markup')

async function buttonsAndArray(collection) {
   const users = await collection.find().sort({ full_name: 1 })
   let buttons = []
   let i = 0
   users.forEach((user) => {
      buttons.push(
         Markup.button(
            user.full_name ?? user.ren_login,
            'primary',
            user.ren_login ? { button: user.ren_login, id: i } : user.coach_id
         )
      )
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
      default:
         break
   }
}

async function changeUser(collection, id, vkid, name) {
   let obj = {
      $set: {
         vk_id: vkid,
         full_name: name,
      },
   }
   await collection.updateOne({ coach_id: id }, obj)
}

function sendToCoach(coach, ren_login, table = 'padavans') {
   connect.query(`UPDATE ${table} SET coach = ? WHERE ren_login = ?`, [
      coach,
      ren_login,
   ])
}

function reset(ren_login) {
   connect.query(`UPDATE padavans SET test_points = 0 WHERE ren_login = ?`, [
      ren_login,
   ])
}

module.exports = {
   selectAll: buttonsAndArray,
   add: add,
   change: changeUser,
   resetPoints: reset,
   sendToCoach: sendToCoach,
}
