const Markup = require('node-vk-bot-api/lib/markup')
const conn = require('./dbConnect')

async function allCoaches() {
   let bd = await conn.asyncConnect()
   let [sql] = await bd.execute('SELECT * FROM `coaches`')
   return [bd, sql]
}
async function selectCoach() {
   let [bd, coaches] = await allCoaches()
   let usersData = []
   coaches.forEach((user) => {
      usersData.push(Markup.button(user.name, 'primary', user.id))
   })
   return usersData
}
async function addCoach(name, vk_id) {
   let [bd, coaches] = await allCoaches()
   let newID = coaches.length + 1
   await bd.execute(
      'INSERT INTO `coaches` (id, name, vk_id) VALUES (?, ?, ?)',
      [newID, name, vk_id]
   )
}
async function changeCoach(id, name, vk_id) {
   let bd = await conn.asyncConnect()
   await bd.execute('UPDATE coaches SET name = ?, vk_id = ? WHERE id = ?', [
      name,
      vk_id,
      id,
   ])
}
async function deleteCoach(id) {
   let bd = await conn.asyncConnect()
   await bd.execute('DELETE FROM `coaches` WHERE `id` = ?', [id])
}

module.exports = {
   select: selectCoach,
   add: addCoach,
   delete: deleteCoach,
   change: changeCoach,
}
