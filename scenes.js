const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const kbd = require('./keyboards')
const query = require('./query')
const { newKeybord } = require('./functions')

function isNumber(val) {
	return typeof val === 'number'
}
const addC = new Scene( // добавить тренера
	'addCoach',
	(ctx) => {
		ctx.scene.next()
		ctx.reply(
			'Напиши полное фамилию и имя нового тренера',
			null,
			kbd.backAction
		)
	},
	(ctx) => {
		ctx.session.name = ctx.message.text
		if (ctx.message.payload) {
			ctx.reply('Выбери действие', null, kbd.coachMenu)
			ctx.scene.leave()
		} else {
			ctx.scene.next()
			ctx.reply(
				'Введи ВК-ID тренера (он должен состоять только из цифр)',
				null,
				kbd.backAction
			)
		}
	},
	(ctx) => {
		let str = ctx.message.text
		if (ctx.message.payload) {
			ctx.scene.next()
			ctx.reply('Выбери действие', null, kbd.coachMenu)
		} else {
			if (str.match(/^\d+$/)) {
				ctx.scene.next()
				ctx.session.id = ctx.message.text
				ctx.reply(
					`Имя - ${ctx.session.name},\nVK_id - ${ctx.session.id},\nдобавить в список тренеров?`,
					null,
					kbd.confirmBtns
				)
			} else {
				ctx.reply(
					'VK_id должен состоять только из цифр!\nВведи id заново.',
					null,
					kbd.backAction
				)
				ctx.scene.enter('addCoach', [1])
			}
		}
	},
	(ctx) => {
		ctx.scene.leave()
		const payload = JSON.parse(ctx.message.payload)
		switch (payload.value) {
			case 'yes':
				query.add('coaches', ctx.session.name, ctx.session.id)
				ctx.reply('Готово!', null, kbd.mainMenu)
				break
			case 'no':
				ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
				break
			case 'stepBack':
				ctx.scene.enter('addCoach')
				break
		}
	}
)
const delC = new Scene( // удалить тренера
	'deleteCoach',
	(ctx) => {
		ctx.scene.next()
		query.selectAll('coaches').then(([data]) => {
			ctx.reply(
				'Кого необходимо удалить?',
				null,
				Markup.keyboard(newKeybord(data)).oneTime()
			)
		})
	},
	(ctx) => {
		const payload = JSON.parse(ctx.message.payload)
		if (payload.value == 'cancel') {
			ctx.scene.leave()
			ctx.reply('Выбери действие', null, kbd.coachMenu)
		} else {
			ctx.scene.next()
			ctx.session.id = payload
			ctx.session.name = ctx.message.text
			ctx.reply(
				`Тренер с именем ${ctx.session.name} будет удалён\nВы уверены?`,
				null,
				kbd.confirmBtns
			)
		}
	},
	(ctx) => {
		const payload = JSON.parse(ctx.message.payload)
		ctx.scene.leave()
		switch (payload.value) {
			case 'yes':
				query.delete(ctx.session.id, 'coaches', 'id')
				ctx.reply('Готово!', null, kbd.mainMenu)
				break
			case 'no':
				ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
				break
			case 'stepBack':
				ctx.scene.enter('deleteCoach')
				break
		}
	}
)
const changeC = new Scene( // изменить тренера
	'changeCoach',
	(ctx) => {
		ctx.scene.next()
		query.selectAll('coaches').then(([data]) => {
			ctx.reply(
				'Кого необходимо изменить?',
				null,
				Markup.keyboard(newKeybord(data)).oneTime()
			)
		})
	},
	(ctx) => {
		if (ctx.message.payload && isNumber(JSON.parse(ctx.message.payload))) {
			ctx.scene.next()
			ctx.session.payload = JSON.parse(ctx.message.payload)
			ctx.session.oldName = ctx.message.text
			ctx.reply('Напиши полное фамилию и имя нового тренера')
		} else if (JSON.parse(ctx.message.payload).value == 'cancel') {
			ctx.reply('Выберите действие', null, kbd.coachMenu)
			ctx.scene.leave()
		} else {
			ctx.scene.leave()
			ctx.scene.enter('changeCoach', 0)
		}
	},
	(ctx) => {
		ctx.scene.next()
		if (!ctx.message.payload) {
			ctx.session.name = ctx.message.text
		}
		ctx.reply(
			'Введи ВК-ID тренера (он должен состоять только из цифр)',
			null,
			kbd.backAction
		)
	},
	(ctx) => {
		let str = ctx.message.text
		ctx.session.id = ctx.message.text
		if (ctx.message.payload) {
			ctx.scene.enter('changeCoach', [1])
		} else {
			if (str.match(/^\d+$/)) {
				ctx.scene.next()
				ctx.reply(
					`Изменения:\n${ctx.session.oldName} -> ${ctx.session.name},\nID - ${ctx.session.id}`,
					null,
					kbd.confirmBtns
				)
			} else {
				ctx.scene.enter('changeCoach', [2])
			}
		}
	},
	(ctx) => {
		if (ctx.message.payload) {
			let pld = JSON.parse(ctx.message.payload)
			switch (pld.value) {
				case 'yes':
					ctx.scene.leave()
					query.change(
						ctx.session.payload,
						ctx.session.name,
						ctx.session.id
					)
					ctx.reply('Готово', null, kbd.mainMenu)
					break
				case 'no':
					ctx.scene.leave()
					ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					break
				case 'stepBack':
					ctx.scene.enter('changeCoach', [ctx.scene.step - 2])
					break
			}
		}
	}
)

const addP = new Scene( // добавить ученика
	'addPadavan',
	(ctx) => {
		ctx.scene.next()
		ctx.reply('Напиши имя нового падавана')
	},
	(ctx) => {
		ctx.session.name = ctx.message.text
		ctx.reply(
			'Введи Ren_login падавана (напиши только цифры логина,\nпрефикс trainCC будет добавлен автоматически)'
		)
		ctx.scene.next()
	},
	(ctx) => {
		ctx.session.login = 'trainCC_' + ctx.message.text
		ctx.reply('Введи ВК-ID падавана (он должен состоять только из цифр)')
		ctx.scene.next()
	},
	(ctx) => {
		let str = ctx.message.text
		if (str.match(/^\d+$/)) {
			ctx.scene.next()
			ctx.session.vkid = ctx.message.text
			query.selectAll('coaches').then(([users]) => {
				ctx.reply(
					'Назначить тренера',
					null,
					Markup.keyboard(newKeybord(users)).oneTime()
				)
			})
		} else {
			ctx.reply('VK-ID должен состоять только из цифр')
			ctx.scene.enter('addPadavan', 2)
		}
	},
	(ctx) => {
		ctx.scene.next()
		ctx.session.coach = ctx.message.payload
		ctx.reply(
			`Имя - ${ctx.session.name},\nVK_id - ${ctx.session.vkid},\nЛогин - ${ctx.session.login},\nТренер - ${ctx.message.text}\nдобавить в список учеников?`,
			null,
			kbd.confirmBtns
		)
	},
	(ctx) => {
		ctx.scene.leave()
		if (ctx.message.payload) {
			const payload = JSON.parse(ctx.message.payload)
			switch (payload.value) {
				case 'yes':
					query.add(
						'padavans',
						ctx.session.vkid,
						ctx.session.name,
						ctx.session.login,
						ctx.session.coach
					)
					ctx.reply('Готово!', null, kbd.mainMenu)
					break
				case 'no':
					ctx.reply('Выбери действие', null, kbd.padavanMenu)
					break
				case 'stepBack':
					ctx.scene.enter('addPadavan', 0)
					break
			}
		} else {
			ctx.reply(
				'Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры, начнём заново'
			)
			ctx.scene.enter('addPadavan', 0)
		}
	}
)

const delP = new Scene( // удалить ученика
	'deletePadavan',
	(ctx) => {
		query.selectAll('padavans').then(([data, users]) => {
			if (users.length == 0) {
				ctx.scene.leave()
				ctx.reply('Список учеников пуст', null, kbd.padavanMenu)
			} else {
				ctx.session.users = users
				let list = ''
				users.forEach((user) => {
					list += `${user.full_name} - ${user.ren_login}\n`
				})
				ctx.reply(
					`Выберите ученика\n${list}`,
					null,
					Markup.keyboard(newKeybord(data)).oneTime()
				)
				ctx.scene.next()
			}
		})
	},
	(ctx) => {
		if (ctx.message.payload) {
			let payload = JSON.parse(ctx.message.payload)
			if (payload.button) {
				ctx.scene.next()
				ctx.session.payload = payload.button
				let user = ctx.session.users[payload.id]
				ctx.reply(
					`Ученик:\nЛогин - ${ctx.session.payload},\nИмя - ${user.full_name}\nбудет удалён.\nВы уверены?`,
					null,
					kbd.confirmBtns
				)
			} else {
				ctx.reply('Выбери действие', null, kbd.padavanMenu)
				ctx.scene.leave()
			}
		} else {
			ctx.scene.leave()
			ctx.scene.enter('deletePadavan', 0)
		}
	},
	(ctx) => {
		if (ctx.message.payload) {
			ctx.scene.leave()
			let payload = JSON.parse(ctx.message.payload)
			switch (payload.value) {
				case 'yes':
					query.delete(ctx.session.payload)
					ctx.reply(`Ученик с логином ${ctx.session.payload} удалён`)
					setTimeout(() => {
						ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					}, 2000)
					break
				case 'no':
					ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					break
				case 'stepBack':
					ctx.scene.enter('deletePadavan', 0)
					break
			}
		} else {
			console.log(ctx.scene.step)
			ctx.reply('Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры')
			ctx.scene.enter('deletePadavan', 1)
		}
	}
)

const clean = new Scene( // сбросить данные
	'clearData',
	(ctx) => {
		query.selectAll('padavans').then(([data, users]) => {
			if (users.length == 0) {
				ctx.scene.leave()
				ctx.reply('Список учеников пуст', null, kbd.padavanMenu)
			} else {
				let list = ''
				users.forEach((user) => {
					list += `${user.full_name} - ${user.ren_login}\n`
				})
				ctx.reply(
					`Выберите ученика, кому небоходимо сбросить все набранные баллы\n${list}`,
					null,
					Markup.keyboard(newKeybord(data)).oneTime()
				)
				ctx.scene.next()
			}
		})
	},
	(ctx) => {
		if (ctx.message.payload) {
			let payload = JSON.parse(ctx.message.payload)
			if (payload.button) {
				ctx.scene.next()
				ctx.session.payload = payload.button
				ctx.reply(
					`Баллы ученика с логином ${ctx.session.payload} будут сброшены\nВы уверены?`,
					null,
					kbd.confirmBtns
				)
			} else {
				ctx.scene.leave()
				ctx.reply(
					'Вы вернулись в настройки учеников',
					null,
					kbd.padavanMenu
				)
			}
		} else {
			ctx.scene.leave()
			ctx.scene.enter('deletePadavan', 0)
		}
	},
	(ctx) => {
		if (ctx.message.payload) {
			let payload = JSON.parse(ctx.message.payload)
			switch (payload.value) {
				case 'yes':
					ctx.scene.leave()
					query.resetPoints(ctx.session.payload)
					ctx.reply(`Баллы сброшены`)
					setTimeout(() => {
						ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					}, 2000)
					break
				case 'no':
					ctx.scene.leave()
					ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					break
				case 'stepBack':
					ctx.scene.enter('clearData', 0)
					break
				default:
					break
			}
		} else {
			console.log(ctx.scene.step)
			ctx.reply('Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры')
			ctx.scene.enter('clearData', 1)
		}
	}
)

const sendToCoach = new Scene( // сбросить данные
	'sendToCoach',
	(ctx) => {
		query.selectAll('padavans').then(([data, users]) => {
			if (users.length == 0) {
				ctx.scene.leave()
				ctx.reply('Список учеников пуст', null, kbd.padavanMenu)
			} else {
				let list = ''
				users.forEach((user) => {
					list += `${user.full_name} - ${user.ren_login}\n`
				})
				ctx.reply(
					`Выберите ученика, которого необходимо отправить к другому тренеру\n${list}`,
					null,
					Markup.keyboard(newKeybord(data)).oneTime()
				)
				ctx.scene.next()
			}
		})
	},
	(ctx) => {
		if (ctx.message.payload) {
			ctx.scene.next()
			let payload = JSON.parse(ctx.message.payload)
			if (payload.button) {
				ctx.session.payload = payload.button
			}
			query.selectAll('coaches').then(([data]) => {
				ctx.reply(
					`Выберите к какому тренеру необходимо отправить`,
					null,
					Markup.keyboard(newKeybord(data)).oneTime()
				)
			})
		} else {
			ctx.scene.leave()
			ctx.reply('Писать ничего не нужно, просто нажмите необходимую кнопку')
			ctx.scene.enter('deletePadavan', 0)
		}
	},
	(ctx) => {
		if (ctx.message.payload) {
			ctx.scene.next()
			let coachId = JSON.parse(ctx.message.payload) - 1
			query.selectAll('coaches').then(([_, users]) => {
				ctx.reply(
					`Ученику с логином ${ctx.session.payload}\nбудет назначен\nновый тренер - ${users[coachId].name}, вы уверены?`,
					null,
					kbd.confirmBtns
				)
			})
		} else {
			ctx.scene.leave()
			ctx.reply('Писать ничего не нужно, просто нажмите необходимую кнопку')
			ctx.scene.enter('deletePadavan', 0)
		}
	},
	(ctx) => {
		if (ctx.message.payload) {
			ctx.scene.leave()
			let payload = JSON.parse(ctx.message.payload)
			switch (payload.value) {
				case 'yes':
					query.sendToCoach(ctx.session.coach, ctx.session.payload)
					ctx.reply(`Готово...`)
					setTimeout(() => {
						ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					}, 2000)
					break
				case 'no':
					ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					break
				case 'stepBack':
					ctx.scene.enter('sendToCoach', 0)
					break
				default:
					break
			}
		} else {
			ctx.scene.leave()
			ctx.reply(
				'Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры, начнем заново'
			)
			ctx.scene.enter('sendToCoach', 0)
		}
	}
)

module.exports = {
	addCoach: addC,
	deleteCoach: delC,
	changeCoach: changeC,
	deletePadavan: delP,
	addPadavan: addP,
	cleanPoints: clean,
	send: sendToCoach,
}
