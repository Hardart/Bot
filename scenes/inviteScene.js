const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Coach, Padavan, RegData } = require('../mongoModels')
const kbd = require('../keyboards')
const query = require('../query')
const api = require('node-vk-bot-api/lib/api')
const { newKeybord, fromBegin } = require('../functions')

const inviting = new Scene( // проверка кода
   'accept_invite',
   async (ctx) => {
      if (!ctx.message.payload) {
         const data = await RegData.findOne({ w_code: ctx.message.text })
         const user = await api('users.get', {
            user_ids: ctx.message.from_id,
            access_token: process.env.VK_TOKEN,
         }).then((data) => data.response[0])
         ctx.session.data = data
         ctx.session.user = user
      }
      const msg = ctx.message.payload
         ? `Хорошо, ты можешь изменить свой выбор`
         : `Дорогой друг, мы рады приветствовать тебя на дистанционно-очном Базовом обучении по Продажам.\nМеня зовут Робби. Я буду тебя сопровождать на протяжении всего космического путешествия по обучению.\n\nУточни, пожалуйста, кто твой тренер?`

      if (ctx.session.data) {
         ctx.scene.next()
         const [buttons] = await query.selectAll(Coach)
         ctx.reply(
            msg,
            null,
            Markup.keyboard(newKeybord(buttons, 'Не знаю кто мой тренер...', 'who')).oneTime()
         )
      } else {
         ctx.reply(`Нет доступа ни к одной программе`)
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         ctx.scene.next()
         let payload = JSON.parse(ctx.message.payload)
         if (payload.value == 'who') {
            ctx.reply('Не знаю')
            ctx.scene.enter('accept_invite')
         } else {
            ctx.session.coachId = payload
            const coach = await Coach.findOne({ coach_id: payload })
            ctx.reply(`Теперь ${coach.full_name} твой тренер\nВы уверены?`, null, kbd.confirmBtns)
         }
      } else {
         fromBegin(ctx, 'accept_invite')
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         ctx.scene.next()
         let payload = JSON.parse(ctx.message.payload)
         const groupId = ctx.groupId
         const msgId = ctx.message.id
         const userID = ctx.message.from_id
         switch (payload.value) {
            case 'yes':
               await api('messages.send', {
                  message: `У тебя в команде пополнение\nСсылка на диалог: https://vk.com/gim${groupId}?sel=${userID}`,
                  user_id: userID,
                  forward: {
                     peer_id: userID,
                     message_ids: [msgId],
                  },
                  access_token: process.env.VK_TOKEN,
                  random_id: 0,
               })
               await query.add(
                  'padavans',
                  ctx.session.user.id,
                  ctx.session.user.last_name + ' ' + ctx.session.user.first_name,
                  ctx.session.data.ren_login,
                  ctx.session.data.ren_pass,
                  ctx.session.data.w_code,
                  ctx.session.coachId
               )
               ctx.reply(
                  'Отлично!\n\nВ процессе тебе предстоит пролететь на ракете планеты:\n\nпланета - ПРОДУКТЫ. Здесь ты узнаешь те продукты, которые продаются в нашем космическом пространстве и их основные параметры.\n\nпланета - КОММУНИКАТИВ. На этой горячей планете тебя ждут основы общения с клиентом и то, что нужно использовать для наиболее эффективной продажи.\n\nпланета - ПРОГРАММЫ. В гостях у этой планеты ты узнаешь на какую кнопку нужно нажать, чтобы узнать решение банка и записать клиента в офис.\n\nКак твой настрой?\nГотов к незабываемым приключениям?',
                  null,
                  kbd.confirmBtns
               )
               break
            case 'no':
               console.log('1')
               ctx.scene.enter('accept_invite')
               break
         }
      } else {
         fromBegin(ctx, 'accept_invite')
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         let payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               // await Padavan.deleteOne({ ren_login: ctx.session.ren_login })
               ctx.scene.leave()
               await ctx.reply('Сейчас сгенерирую для тебя учётную запись и добавлю в свою команду')

               setTimeout(async () => {
                  await ctx.reply(
                     `========================\r\nЛОГИН: ${ctx.session.data.ren_login}\r\nПАРОЛЬ: ${ctx.session.data.ren_pass}\r\n========================\n\n\n`
                  )
                  await ctx.reply('http://webtutor.rencredit.ru')
               }, 3000)
               setTimeout(async () => {
                  await ctx.reply(
                     'Если что, я всегда рядом и жду твоей команды 🤖',
                     null,
                     kbd.padavanMainMenu
                  )
               }, 5000)
               break
            case 'no':
               await Padavan.deleteOne({ vk_id: ctx.session.user.id })
               ctx.scene.enter('accept_invite')
               break
         }
      } else {
         await Padavan.deleteOne({ vk_id: ctx.session.user.id })
         fromBegin(ctx, 'accept_invite')
      }
   }
)

const question = new Scene('quest', async (ctx) => {
   // вопрос тренеру
   if (ctx.message.payload) {
      const pad = await Padavan.findOne({ vk_id: ctx.message.from_id })
      const coach = await Coach.findOne({ coach_id: pad.coach_id })
      console.log(coach)
      // ctx.session.user = pad
   }
   const msg = ctx.message.payload
      ? `Хорошо, ты можешь изменить свой выбор`
      : `Дорогой друг, мы рады приветствовать тебя на дистанционно-очном Базовом обучении по Продажам.\nМеня зовут Робби. Я буду тебя сопровождать на протяжении всего космического путешествия по обучению.\n\nУточни, пожалуйста, кто твой тренер?`

   if (ctx.session.data) {
      ctx.scene.next()
      const [buttons] = await query.selectAll(Coach)
      ctx.reply(
         msg,
         null,
         Markup.keyboard(newKeybord(buttons, 'Не знаю кто мой тренер...', 'who')).oneTime()
      )
   } else {
      ctx.reply(`Нет доступа ни к одной программе`)
   }
})

module.exports = {
   inviteCodeScene: inviting,
   questionScene: question,
}
