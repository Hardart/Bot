const express = require('express');
const mongoose = require('mongoose')
const Padavan = require('./models/padavans')
const RegData = require('./models/reg_data')
const VkBot = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Markup = require('node-vk-bot-api/lib/markup');
const api = require('node-vk-bot-api/lib/api');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 80
const bot = new VkBot({
	token: '013937ce5dee436c8d9343e9bf71e2a70130dcbf893d047557b38da2c966a0785adf516e783c640ff98fe',
	confirmation: '19477d52',
});

app.use(express.json())

bot.command('/sport', (ctx) => {
	ctx.reply('Select your sport', null, Markup
		.keyboard([
			[Markup.button('Fine', 'positive')],
			[Markup.button('Bad', 'negative')]
		])
		.oneTime())
});


bot.on(async (ctx) => {
	const payload = ctx.message.payload
	const userMsg = ctx.message.text
	const userID = ctx.message.from_id
	const user = await api('users.get', {
		user_ids: userID,
		access_token: bot.settings.token
	}).then(data => data.response[0])

	const pdvn = await Padavan.find({ "vk_id": userID }).then(data => data)
	if (pdvn[0]) {
		if (payload) {
			let btn = JSON.parse(payload)
			console.log(btn)
			switch (btn.button) {
				case 'Bad':
					ctx.reply('Btn clicked')
					break
				case 'Fine':
					ctx.reply('Btn clicked')
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
		await mongoose.connect('mongodb+srv://hardart:134679qaZ@cluster0.6wswz.mongodb.net/mongo', {
			useFindAndModify: false,
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		app.listen(PORT, () => {
			console.log('Ok');
		})
	}
	catch (e) {
		console.log(e)
	}
}
start()
