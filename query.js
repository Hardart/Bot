const db = require('./dbConnect')
const connect = db.connection().promise()
const Markup = require('node-vk-bot-api/lib/markup')

function selectAll(table) {
	return connect.query(`SELECT * FROM ${table}`).then(([users]) => {
		let usersData = []
		let i = 0
		users.forEach((user) => {
			usersData.push(
				Markup.button(
					user.name ?? user.ren_login,
					'primary',
					user.id ? user.id : { button: user.ren_login, id: i }
				)
			)
			i++
		})
		return [usersData, users]
	})
}
function addUser(table = 'coaches', ...args) {
	if (table == 'coaches') {
		selectAll('coaches').then(([, users]) => {
			connect.query(
				'INSERT INTO coaches (id, name, vk_id) VALUES (?, ?, ?)',
				[users.length + 1, args[0], args[1]]
			)
		})
	} else {
		connect.query(
			'INSERT INTO padavans (vk_id, full_name, ren_login, coach) VALUES (?, ?, ?, ?)',
			[args[0], args[1], args[2], args[3]]
		)
	}
}
function deleteUser(value, table = 'padavans', field = 'ren_login') {
	connect.query(`DELETE FROM ${table} WHERE ${field} = ?`, [value])
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
	selectAll: selectAll,
	delete: deleteUser,
	add: addUser,
	change: changeUser,
	resetPoints: reset,
	sendToCoach: sendToCoach,
}
