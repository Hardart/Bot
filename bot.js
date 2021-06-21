require('dotenv/config')
const { photo, newKeybord, sendRequest } = require('./functions')
const kbd = require('./keyboards')
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
const url = "http://robb-i.ru/php_bot/post.php"
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


const scene = new Scene('addCoach',
  (ctx) => {
    ctx.scene.next();
    ctx.reply('Напиши полное фамилию и имя нового тренера');
  },
  (ctx) => {
    ctx.session.name = ctx.message.text;

    ctx.scene.next();
    ctx.reply('Теперь введи ВК-ID тренера');
  },
  (ctx) => {
		ctx.session.id = ctx.message.text;
		ctx.scene.next();
		ctx.reply(`Имя - ${ctx.session.name},\nVK_id - ${ctx.session.id},\nдобавить в список тренеров?`, null, kbd.confirmBtns());
  },
  (ctx) => {
	  ctx.scene.leave()
	  const payload = JSON.parse(ctx.message.payload)
	  const body = {
		value: "add_coach",
		coach_name: ctx.session.name,
		coach_id: ctx.session.id
	 } 
	if (payload.add_coach == "yes") {
		sendRequest('POST', url, body).then(data => {
			ctx.reply(data)
		})
	} else {
		ctx.reply("Вы вернулись в главное меню", null, kbd.mainMenu())
	}
  }
)

const changeScene = new Scene('changeCoach',
  (ctx) => {
    	ctx.scene.next();
    	sendRequest('POST', url, {value: "show_all_coaches"}).then(data => {
			let body = {
				value: "coach"
			}
			ctx.reply('Кого необходимо изменить?', null, Markup
				.keyboard(newKeybord(data, 2, body))
				.oneTime()
			)
		})
	},
  (ctx) => {
		const payload = JSON.parse(ctx.message.payload)
		ctx.session.payload = payload
		ctx.session.oldName = ctx.message.text
    	ctx.scene.next();
    	ctx.reply('Напиши полное фамилию и имя нового тренера');
	},
  (ctx) => {
		ctx.session.name = ctx.message.text;
    	ctx.scene.next();
    	ctx.reply('Теперь введи ВК-ID тренера');
	},
	(ctx) => {
		ctx.scene.leave()
		
		let body = {
			value: "update_coaches",
			coach_vk_id: +ctx.message.text,
			coach_name: ctx.session.name,
			coach_id: ctx.session.payload
		}
		
		sendRequest('POST', url, body).then(data => {
			ctx.reply(data)
		})
  }
)

const deleteScene = new Scene('deleteCoach',
  (ctx) => {
    	ctx.scene.next();
    	sendRequest('POST', url, {value: "show_all_coaches"}).then(data => {
			ctx.reply('Кого необходимо удалить?', null, Markup
				.keyboard(newKeybord(data, 2))
				.oneTime()
			)
		})
	},
  (ctx) => {
		const payload = JSON.parse(ctx.message.payload)
		ctx.session.id = payload
		ctx.session.name = ctx.message.text;
		console.log(payload);
    	ctx.scene.next();
		ctx.reply(`Тренер с именем ${ctx.session.name} будет удалён\nВы увенерены?`, null, kbd.confirmBtns())
  },
  (ctx) => {
		const payload = JSON.parse(ctx.message.payload)
    	ctx.scene.leave();
		let body = {
			value: "delete_coach",
			coach_id: ctx.session.id,
			coach_name: ctx.session.name
		}
		if (payload.add_coach == "yes") {
			sendRequest('POST', url, body).then(data => {
				ctx.reply(data)
			})
		} else {
			ctx.reply("Вы вернулись в главное меню", null, kbd.mainMenu())
		}
  }
)

const session = new Session();
const stage = new Stage(scene, changeScene, deleteScene);

bot.use(session.middleware());
bot.use(stage.middleware());

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

bot.command('/config', (ctx) => {
	ctx.reply('Основные настройки', null, kbd.mainMenu())
})


bot.on(async (ctx) => {
	const payload = ctx.message.payload
	const userMsg = ctx.message.text
	const userID = ctx.message.from_id
	const user = await api('users.get', {
		user_ids: userID,
		access_token: TOKEN
	}).then(data => data.response[0])

	if (payload) {
		const btn = JSON.parse(payload)
		switch (btn.value) {
			case 'delete_coach':
				ctx.scene.enter('deleteCoach')
				break
			case 'change_coach':
				ctx.scene.enter('changeCoach')
				break
			case 'add_coach':
				ctx.scene.enter('addCoach')
				break
			case 'coach_config':
				ctx.reply('Выбери действие', null, kbd.menuCoach())
				break
			case 'coach':
				ctx.reply('yep')
				break
			default:
				ctx.reply(`You clicked button - ${btn.button}`)
		}
	} else {
		ctx.reply('Кого удалить?', null, Markup
			.keyboard(newKeybord(users, 5))
			.oneTime()
		)
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
			console.log('Сервер запустился')
		})
	}
	catch (e) {
		console.log(e)
	}
}

start()
