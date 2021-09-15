require('dotenv/config')
const fs = require('fs')
const path = require('path')
const kbd = require('./keyboards')
const { newKeybord, photo, shuffle, wordEndings } = require('./functions')
const testScenes = require('./scenes/testScene')
const coachScene = require('./scenes/coachScene')
const padavanScene = require('./scenes/padavansScene')
const inviteScene = require('./scenes/inviteScene')
const { Padavan, Test, Coach } = require('./mongoModels')
const query = require('./query')
const express = require('express')
const VkBot = require('node-vk-bot-api')
const api = require('node-vk-bot-api/lib/api')
const mongoose = require('mongoose')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const usersRoute = require('./routes/users')
const pugRoute = require('./routes/pug')
const rplRoute = require('./routes/rpl')
const TOKEN = process.env.VK_TOKEN
const app = express()
const PORT = process.env.PORT || 80
const bot = new VkBot({
   token: TOKEN,
   confirmation: process.env.VK_CONFIRM,
})
// require('events').defaultMaxListeners = 15

// photo('Insta.png', process.env.VK_ID, TOKEN, bot) // отправка фото

app.set('views', './views')
app.set('view engine', 'pug')
app.use('/post', usersRoute)
app.use('/pug', pugRoute)
app.use('/rpl', rplRoute)
app.use(express.json())
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.urlencoded({ extended: true }))

// --------- блок сценариев -------------
const addScene = coachScene.addCoach
const changeScene = coachScene.changeCoach
const deleteScene = coachScene.deleteCoach
const addPadScene = padavanScene.addPadavan
const deletePadScene = padavanScene.deletePadavan
const cleanPoints = padavanScene.cleanPoints
const sendToCoach = padavanScene.send
const addTest = testScenes.addTest
const deleteTest = testScenes.deleteTest
const changeTest = testScenes.changeTest
const acceptInvite = inviteScene.inviteCodeScene
const question = inviteScene.questionScene

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
   deleteTest,
   changeTest,
   question,
   acceptInvite
)

bot.use(session.middleware())
bot.use(stage.middleware())
// --------------------------------------

bot.command('/config', (ctx) => {
   ctx.reply(`Отлично!\nВот основные настройки`, null, kbd.mainMenu)
})

bot.command('file', async (ctx) => {
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
   const groupId = ctx.groupId
   const msg = ctx.message.text
   const userID = ctx.message.from_id
   const msgId = ctx.message.id
   // КНОПКА
   if (payload) {
      const btn = JSON.parse(payload)
      switch (btn.value) {
         case 'score_table':
            let thisUser = await Padavan.findOne({ vk_id: userID })
            if (!thisUser) {
               thisUser = await Coach.findOne({ vk_id: userID })
            }
            let padavans = await Padavan.find({ coach_id: thisUser.coach_id }).sort({ points: -1 })
            let list = 'Список пуст'
            if (padavans.length != 0) {
               list = '===========================\n'
               let i = 1
               padavans.forEach((pad) => {
                  list += `${i}. ${pad.full_name} - ${pad.points} ${wordEndings(pad.points, [
                     ' балл',
                     ' балла',
                     ' баллов',
                  ])}\n`
                  i++
               })
            }
            ctx.reply(list, null, kbd.padavanMainMenu)
            break
         case 'bonus':
            ctx.reply('Бонус', null, kbd.menu)
            break
         case 'clean_list':
            const coach = await Coach.findOne({ vk_id: userID })
            await Padavan.deleteMany({ coach_id: coach.coach_id })
            ctx.reply('Список учеников очищен', null, kbd.menu)
            break
         case 'exit':
            ctx.reply('Меню', null, kbd.menu)
            break

         case 'send_question':
            ctx.scene.enter('quest')
            break

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
         case 'change_test':
            ctx.scene.enter('changeTest')
            break
         case 'delete_test':
            ctx.scene.enter('deleteTest')
            break

         default:
            ctx.reply(`Вы нажали кнопку, но она пока еще не настроена`, null, kbd.mainMenu)
      }
   }
   // ЧЕЛОВЕК
   else {
      const coachVK = await Coach.findOne({ vk_id: userID })
      // ТРЕНЕР
      if (coachVK) {
         ctx.reply('Ты в системе', null, kbd.menu)
      }
      // УЧЕНИК
      else {
         const userVK = await Padavan.findOne({ vk_id: userID })
         if (userVK) {
            ctx.reply(
               'Тебе не зачем просто так тратить свое время...\nвыбирай и жми на кнопки',
               null,
               kbd.padavanMainMenu
            )
         } else {
            ctx.scene.enter('accept_invite')
         }
      }
   }
})

app.post('/bot', bot.webhookCallback)

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
