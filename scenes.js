const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const kbd = require('./keyboards')
const coach = require('./queryCoach')
const { newKeybord } = require('./functions')

function isNumber(val) {
	return typeof val === 'number'
}
const add = new Scene(
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
				coach.add(ctx.session.name, ctx.session.id)
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
module.exports = {
	addCoach: add,
	deleteCoach: new Scene(
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
	),
	changeCoach: new Scene(
		'changeCoach',
		(ctx) => {
			ctx.scene.next()
			let body = {
				value: 'coach',
			}
			coach.select().then((data) => {
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
						coach.change(
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
	),
}
