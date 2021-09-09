const db = require('./dbConnect')
const connect = db.connection().promise()
const { Coach, Padavan } = require('./mongoModels')
const Markup = require('node-vk-bot-api/lib/markup')

async function allToBtns(collection) {
  const coaches = await collection.find().sort({ coach_id: 1 })
  let usersData = []
  let i = 0
  coaches.forEach((user) => {
    usersData.push(
      Markup.button(
        user.full_name ?? user.ren_login,
        'primary',
        user.coach_id ? user.coach_id : { button: user.ren_login, id: i }
      )
    )
    i++
  })
  return [usersData, coaches]
}

async function addUser(collection = 'coaches', ...args) {
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

function changeUser(id, name, vk_id, table = 'coaches') {
  connect.query(`UPDATE ${table} SET name = ?, vk_id = ? WHERE id = ?`, [
    name,
    vk_id,
    id,
  ])
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
  selectAll: allToBtns,
  add: addUser,
  change: changeUser,
  resetPoints: reset,
  sendToCoach: sendToCoach,
}
