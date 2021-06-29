require('dotenv/config')
const kbd = require('./keyboards')
const db = require('./dbConnect')
const scenes = require('./scenes')
// const { Padavan, RegData } = require('./models/padavans')
// const mongoose = require('mongoose')
const express = require('express')
const VkBot = require('node-vk-bot-api')
const api = require('node-vk-bot-api/lib/api')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const usersRoute = require('./routes/users')
const pugRoute = require('./routes/pug')
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

// --------- блок сценариев -------------
const addScene = scenes.addCoach
const changeScene = scenes.changeCoach
const deleteScene = scenes.deleteCoach
const session = new Session()
const stage = new Stage(addScene, changeScene, deleteScene)

bot.use(session.middleware())
bot.use(stage.middleware())
// --------------------------------------

// connection.query(
//    'INSERT INTO `coaches` (name, vk_id) VALUES (?, ?)',
//    ['John', 745641],
//    function (err, results) {
//       // results.forEach((user) => {
//       //    console.log(user.name)
//       // })
//       console.log(results)
//    }
// )

bot.command('/config', (ctx) => {
   ctx.reply(`Отлично!\nВот основные настройки`, null, kbd.mainMenu)
})

bot.on(async (ctx) => {
   const payload = ctx.message.payload
   const userMsg = ctx.message.text
   const userID = ctx.message.from_id
   const user = await api('users.get', {
      user_ids: userID,
      access_token: TOKEN,
   }).then((data) => data.response[0])

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
            ctx.reply('Выбери действие', null, kbd.coachMenu)
            break
         case 'stepBack':
            ctx.scene.enter('changeCoach', [1])
            break
         default:
            ctx.reply(`Вы нажали кнопку, но у нее нет никакого действия`)
      }
   } else {
      ctx.reply('Без знаний ты не сможешь настроить мои программы')
   }
})

app.post('/', bot.webhookCallback)

async function start() {
   try {
      // await mongoose.connect(process.env.DB_CONN, {
      //    useFindAndModify: false,
      //    useNewUrlParser: true,
      //    useUnifiedTopology: true,
      // })
      db.connection().connect((err) => {
         err ? console.log(err) : console.log('БД подключена')
      })
      app.listen(PORT, () => {
         console.log('Сервер запустился')
      })
   } catch (e) {
      console.log(e)
   }
}

start()
