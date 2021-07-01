const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const kbd = require('./keyboards')
const coach = require('./queryCoach')
const query = require('./query')
const { newKeybord } = require('./functions')

function isNumber(val) {
	return typeof val === 'number'
}
const addC = new Scene(
	'addCoach',
	(ctx) => {
		ctx.scene.next()
		ctx.reply('Напиши полное фамилию и имя нового тренера')
	},
	(ctx) => {
		ctx.session.name = ctx.message.text

		ctx.scene.next()
		ctx.reply('Введи ВК-ID тренера (он должен состоять только из цифр)')
	},
	(ctx) => {
		let str = ctx.message.text
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
				ctx.scene.enter('addCoach', [1])
				break
		}
	}
)
const delC = new Scene(
	'deleteCoach',
	(ctx) => {
		ctx.scene.next()
		coach.select().then((data) => {
			ctx.reply(
				'Кого необходимо удалить?',
				null,
				Markup.keyboard(newKeybord(data, 2)).oneTime()
			)
		})
	},
	(ctx) => {
		ctx.scene.next()
		const payload = JSON.parse(ctx.message.payload)
		ctx.session.id = payload
		ctx.session.name = ctx.message.text
		ctx.reply(
			`Тренер с именем ${ctx.session.name} будет удалён\nВы уверены?`,
			null,
			kbd.confirmBtns
		)
	},
	(ctx) => {
		const payload = JSON.parse(ctx.message.payload)
		ctx.scene.leave()
		if (payload.value == 'yes') {
			coach.delete(ctx.session.id)
			ctx.reply('Готово!', null, kbd.mainMenu)
		} else {
			ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
		}
	}
)
const changeC = new Scene(
	'changeCoach',
	(ctx) => {
		ctx.scene.next()
		let body = {
			value: 'coach',
		}
		query.selectAll('coaches').then(([data]) => {
			ctx.reply(
				'Кого необходимо изменить?',
				null,
				Markup.keyboard(newKeybord(data, 2, body)).oneTime()
			)
		})
	},
	(ctx) => {
		ctx.scene.next()
		if (isNumber(JSON.parse(ctx.message.payload))) {
			ctx.session.payload = JSON.parse(ctx.message.payload)
			ctx.session.oldName = ctx.message.text
		}
		ctx.reply('Напиши полное фамилию и имя нового тренера')
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

const addP = new Scene(
	'addPadavan',
	(ctx) => {
		ctx.scene.next()
		ctx.reply('Напиши имя нового падавана')
	},
	(ctx) => {
		ctx.session.name = ctx.message.text
		ctx.scene.next()
		ctx.reply('Введи Ren_login падавана (CC_66)')
	},
	(ctx) => {
		ctx.scene.next()
		ctx.session.login = ctx.message.text
		ctx.reply('Введи ВК-ID падавана (он должен состоять только из цифр)')
	},
	(ctx) => {
		let str = ctx.message.text
		if (str.match(/^\d+$/)) {
			ctx.scene.next()
			ctx.session.vkid = ctx.message.text
			coach.select().then((data) => {
				ctx.reply(
					'Назначить тренера',
					null,
					Markup.keyboard(newKeybord(data, 2)).oneTime()
				)
			})
		} else {
			ctx.scene.enter('addPadavan', [1])
		}
	},
	(ctx) => {
		ctx.scene.next()
		ctx.session.coach = ctx.message.text
		ctx.reply(
			`Имя - ${ctx.session.name},\nVK_id - ${ctx.session.vkid},\nЛогин - ${ctx.session.login}\nТренер - ${ctx.message.text}\nдобавить в список падаванов?`,
			null,
			kbd.confirmBtns
		)
	},
	(ctx) => {
		ctx.scene.leave()
		const payload = JSON.parse(ctx.message.payload)
		switch (payload.value) {
			case 'yes':
				pad.add(
					ctx.session.login,
					ctx.session.name,
					ctx.session.vkid,
					ctx.session.coach
				)
				ctx.reply('Готово!', null, kbd.mainMenu)
				break
			case 'no':
				ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
				break
			case 'stepBack':
				ctx.scene.enter('addPadavan', 0)
				break
		}
	}
)

const delP = new Scene(
	'deletePadavan',
	(ctx) => {
		let body = {
			value: 'coach',
		}
		pad.select().then(([kbd, users]) => {
			if (users.length == 0) {
				ctx.scene.leave()
				ctx.reply('Список учеников пуст', null, kbd.mainMenu)
			} else {
				let list = ''
				users.forEach((user) => {
					list += `${user.full_name} - ${user.ren_login}\n`
				})
				ctx.reply(
					`Выберите ученика\n${list}`,
					null,
					Markup.keyboard(newKeybord(kbd, 2, body)).oneTime()
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
			ctx.reply(
				`Ученик с логином ${ctx.session.payload} будет удалён\nВы уверены?`,
				null,
				kbd.confirmBtns
			)
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
					pad.delete(ctx.session.payload)
					ctx.reply(`Ученик с логином ${ctx.session.payload} удалён`)
					setTimeout(() => {
						ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					}, 2000)
					break
				case 'no':
					ctx.scene.leave()
					ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
					break
				case 'stepBack':
					ctx.scene.enter('deletePadavan', 0)
					break
				default:
					break
			}
		} else {
			console.log(ctx.scene.step)
			ctx.reply('Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры')
			ctx.scene.enter('deletePadavan', 1)
		}
	}
)
module.exports = {
	addCoach: addC,
	deleteCoach: delC,
	changeCoach: changeC,
	deletePadavan: delP,
	addPadavan: addP,
}
