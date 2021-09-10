require('dotenv/config')
const fs = require('fs')
const path = require('path')
const kbd = require('./keyboards')
const { newKeybord, photo } = require('./functions')
const scenes = require('./scenes')
const { Padavan, Test, Coach } = require('./mongoModels')
const mongoose = require('mongoose')
const express = require('express')
const VkBot = require('node-vk-bot-api')
const api = require('node-vk-bot-api/lib/api')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const usersRoute = require('./routes/users')
const pugRoute = require('./routes/pug')
const script = require('./routes/pug')
const TOKEN = process.env.VK_TOKEN
const app = express()
const PORT = process.env.PORT || 80
const bot = new VkBot({
   token: TOKEN,
   confirmation: process.env.VK_CONFIRM,
})

// photo('Insta.png', process.env.VK_ID, TOKEN, bot) // отправка фото

app.set('views', './views')
app.set('view engine', 'pug')
app.use('/post', usersRoute)
app.use('/pug', pugRoute)
app.use(express.json())
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.urlencoded({ extended: true }))

// --------- блок сценариев -------------
const addScene = scenes.addCoach
const changeScene = scenes.changeCoach
const deleteScene = scenes.deleteCoach
const addPadScene = scenes.addPadavan
const deletePadScene = scenes.deletePadavan
const cleanPoints = scenes.cleanPoints
const sendToCoach = scenes.send
const addTest = scenes.addTest
const deleteTest = scenes.deleteTest
const session = new Session()
const stage = new Stage(
   addScene,
   changeScene,
   deleteScene,
   addPadScene,
   deletePadScene,
   cleanPoints,
   sendToCoach,
   addTest,
   deleteTest
)

bot.use(session.middleware())
bot.use(stage.middleware())
// --------------------------------------

bot.command('/config', (ctx) => {
   ctx.reply(`Отлично!\nВот основные настройки`, null, kbd.mainMenu)
})

bot.command('Test', async (ctx) => {
   fs.readFile('./files/coach.json', 'utf8', (err, data) => {
      if (err) {
         console.log(err)
      } else {
         let res = JSON.parse(data)
         const newUser = {
            name: 'Dana',
            age: 27,
            gender: 'Female',
            department: 'Organic',
            car: 'Mazda',
         }
         if (!res.CC_99) {
            res.CC_99 = newUser
            fs.writeFileSync(file, JSON.stringify(res))
         }
         console.log(res.CC_99)
      }
   })
   // console.log(user)
   await ctx.reply('ok')
})

bot.on(async (ctx) => {
   const payload = ctx.message.payload
   const userMsg = ctx.message.text
   const userID = ctx.message.from_id
   const user = await api('users.get', {
      user_ids: userID,
      access_token: TOKEN,
   }).then((data) => data.response[0])
   // КНОПКА
   if (payload) {
      const btn = JSON.parse(payload)
      switch (btn.value) {
         case 'main_menu':
            ctx.reply(`Вы вернулись в главное меню...`, null, kbd.mainMenu)
            break
         case 'coach_config':
            ctx.reply('Выбери действие', null, kbd.coachMenu)
            break
         case 'delete_coach':
            ctx.scene.enter('deleteCoach')
            break
         case 'change_coach':
            ctx.scene.enter('changeCoach')
            break
         case 'add_coach':
            ctx.scene.enter('addCoach')
            break

         case 'padavan_config':
            ctx.reply('Выбери действие', null, kbd.padavanMenu)
            break
         case 'add_padavan':
            ctx.scene.enter('addPadavan')
            break
         case 'send_to_coach':
            ctx.scene.enter('sendToCoach')
            break
         case 'clear_data':
            ctx.scene.enter('clearData')
            break
         case 'delete_padavan':
            ctx.scene.enter('deletePadavan')
            break

         case 'test_config':
            ctx.reply('Выбери действие', null, kbd.testMenu)
            break
         case 'add_test':
            ctx.scene.enter('addTest')
            break
         case 'change_coach':
            ctx.scene.enter('changeCoach')
            break
         case 'delete_test':
            ctx.scene.enter('deleteTest')
            break

         case 'stepBack':
            ctx.scene.enter('changeCoach', [1])
            break
         default:
            ctx.reply(`Вы нажали кнопку, но она пока еще не настроена`)
      }
   }
   // УЧЕНИК
   else {
      ctx.reply('Без кода доступа ты не сможешь настроить мои программы')
   }
})

app.post('/', bot.webhookCallback)

async function start() {
   try {
      await mongoose.connect(process.env.DB_CONN, {
         useFindAndModify: false,
         useNewUrlParser: true,
         useUnifiedTopology: true,
      })
      console.log('БД подключена')
      app.listen(PORT, () => {
         console.log('Сервер запустился')
      })
   } catch (e) {
      console.log(e)
   }
}

start()
