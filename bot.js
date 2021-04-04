require('dotenv/config')
const { photo } = require('./functions')
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
const TOKEN = process.env.VK_TOKEN

const app = express()
const PORT = process.env.PORT || 80
const bot = new VkBot({
	token: TOKEN,
	confirmation: process.env.VK_CONFIRM,
})

<<<<<<< HEAD
// app.set('views', './views')
// app.set('view engine', 'pug')
=======
app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'assets')))
app.use('/post', usersRoute)
app.use('/pug', pugRoute)
<<<<<<< HEAD
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

=======
>>>>>>> 10dd844357b640fa20445e671111365a3f558754
>>>>>>> a2b56fa887e0a9fe32b2d701955c5a191f53175c

// app.use(express.static(path.join(__dirname, 'assets')))
// app.use('/post', usersRoute)
// app.use('/pug', pugRoute)
app.use(express.json())
bot.command('/sport', (ctx) => {
	ctx.reply('Select your sport', null)
})
const el1 = {
	title: "Название",
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
const el2 = {
	title: "Название",
	description: "Описание",
	action: {
		type: "open_link",
		link: "https://vk.com"
	},
	buttons: [{
		action: {
			type: "text",
			label: "Кнопка 1"
		}
	},
	{
		action: {
			type: "text",
			label: "Кнопка 2"
		}
	}],

}
// photo('Castle.png', process.env.VK_ID, TOKEN, bot) // отправка фото
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

bot.on(async (ctx) => {
	const payload = ctx.message.payload
	const userMsg = ctx.message.text
	const userID = ctx.message.from_id
	const user = await api('users.get', {
		user_ids: userID,
		access_token: TOKEN
	}).then(data => data.response[0])

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
			}
		} else {
			ctx.reply('Выбери тренера', null, Markup
				.keyboard([
					[Markup.button('Fine', 'primary')],
					[Markup.button('Bad', 'negative')]
				])
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
