require('dotenv/config')
const { photo, newKeybord } = require('./functions')
const { Padavan, RegData } = require('./models/padavans')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const VkBot = require('node-vk-bot-api')
const api = require('node-vk-bot-api/lib/api')
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const Markup = require('node-vk-bot-api/lib/markup')
const usersRoute = require('./routes/users')
const pugRoute = require('./routes/pug')
const { sha256 } = require('js-sha256')
const TOKEN = process.env.VK_TOKEN

const app = express()
const PORT = process.env.PORT || 80
const bot = new VkBot({
	token: TOKEN,
	confirmation: process.env.VK_CONFIRM,
})
// photo('Castle.png', process.env.VK_ID, TOKEN, bot) // отправка фото

app.set('views', './views')
app.set('view engine', 'pug')
app.use('/post', usersRoute)
app.use('/pug', pugRoute)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
bot.command('/sport', (ctx) => {
	ctx.reply('Select your sport', null)
})

const el1 = {
	title: "Элемент 1",
	description: "Описание",
	action: {
		type: "open_link",
		link: "https://vk.com"
	},
	buttons: [{
		action: {
			type: "vkpay",
			hash: "action=pay-to-group&amount=1&group_id=202655096"
		}
	},
	{
		action: {
			type: "text",
			label: "Кнопка 2"
		}
	}]
}

let sum = 15
let account = '7852354'
let desc = 'Testing payments'
let secretKey = '5db9a6efe5ec80c202bf3aa399c1be05'
let signature = sha256(account + '{up}' + desc + '{up}' + sum + '{up}' + secretKey)
let url = `https://unitpay.money/pay/308451-bd64b?sum=${sum}&account=${account}&desc=${desc}`

const el2 = {
	title: "Элемент 2",
	description: "Описание",
	action: {
		type: "open_link",
		link: url
	},
	buttons: [{
		action: {
			type: "open_link",
			link: url,
			label: "Оплатить"
		}
	},
	{
		action: {
			type: "callback",
			label: "Callback",
			payload: { payload: "func" }
		}
	}],

}

const templ = {
	type: "carousel",
	elements: [
		el1,
		el2
	]
}

function sendTemplate() {
	api('messages.send', {
		peer_id: process.env.VK_ID,
		access_token: TOKEN,
		template: JSON.stringify(templ),
		message: 'Првиет',
		random_id: 0
	})
}
sendTemplate()

let users = [
	Markup.button('1', 'primary'),
	Markup.button('2', 'primary'),
	Markup.button('3', 'primary'),
	Markup.button('4', 'primary'),
	Markup.button('5', 'primary'),
	Markup.button('6', 'primary'),
	Markup.button('7', 'primary'),
	Markup.button('8', 'primary'),
	Markup.button('9', 'primary'),
	Markup.button('10', 'primary'),
	Markup.button('11', 'primary'),
	Markup.button('12', 'primary'),
	Markup.button('13', 'primary'),
	Markup.button('14', 'primary'),
	Markup.button('15', 'primary'),
	Markup.button('16', 'primary'),
	Markup.button('17', 'primary'),
	Markup.button('18', 'primary')
]

bot.event('message_event', (ctx) => {
	// ctx.reply('Your message was editted');
	// let eventData = {
	// 	"type": "show_snackbar",
	// 	"text": "Покажи исчезающее сообщение на экране"
	// }
	// let eventID = ctx.message.event_id
	// let user = ctx.message.user_id
	// api('messages.sendMessageEventAnswer', {
	// 	event_id: eventID,
	// 	user_id: user,
	// 	peer_id: user,
	// 	event_data: JSON.stringify(eventData),
	// 	access_token: TOKEN
	// })
	ctx.reply('Select your sport', null, Markup
		.keyboard([
			'Football',
			'Basketball',
		])
		.oneTime(),
	)
});

bot.on(async (ctx) => {
	const payload = ctx.message.payload
	const userMsg = ctx.message.text
	const userID = ctx.message.from_id
	const user = await api('users.get', {
		user_ids: userID,
		access_token: TOKEN
	}).then(data => data.response[0])

	let idToString = userID.toString()
	const pdvn = await Padavan.find({ "vk_id": userID }).then(data => data)
	if (pdvn[0]) {
		if (payload) {
			const btn = JSON.parse(payload)
			switch (btn.button) {
				case 'Bad':
					ctx.reply('Bad clicked')
					break
				case 'Fine':
					ctx.reply('Fine clicked')
					break
				case 'func':
					let sum = 15
					let account = '7852354'
					let desc = 'Testing payments'
					let secretKey = '5db9a6efe5ec80c202bf3aa399c1be05'
					let signature = sha256(account + '{up}' + desc + '{up}' + sum + '{up}' + secretKey)
					let url = `https://unitpay.money/pay/308451-bd64b?sum=${sum}&account=${account}&desc=${desc}`
					ctx.reply('Func clicked')
					break
				default:
					ctx.reply(`You clicked button - ${btn.button}`)
			}
		} else {
			ctx.reply('Кого удалить?', null, Markup.keyboard(
				newKeybord(users, 5)
			)
			)
		}
	} else {
		const string = await RegData.find({ "w_code": userMsg }).then(data => (data[0]))
		if (string) {
			const newPdvn = new Padavan({
				vk_id: userID,
				full_name: user.last_name + " " + user.first_name,
				ren_login: string.ren_login,
				ren_pass: string.ren_pass,
				w_code: string.w_code,
				options: {
					hasQ: false,
					changeCoach: false
				}
			})
			await newPdvn.save()
			ctx.reply("Add to collection MongoDB")
		} else {
			ctx.reply(user.first_name)
		}
	}
})

app.post('/', bot.webhookCallback)


async function start() {
	try {
		await mongoose.connect(process.env.DB_CONN, {
			useFindAndModify: false,
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		app.listen(PORT, () => {
			console.log('Server has been started')
		})
	}
	catch (e) {
		console.log(e)
	}
}

start()
