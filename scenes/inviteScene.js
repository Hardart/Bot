const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Coach, Padavan, RegData } = require('../mongoModels')
const kbd = require('../keyboards')
const query = require('../query')
const api = require('node-vk-bot-api/lib/api')
const { newKeybord, mistake } = require('../functions')

const inviting = new Scene( // удалить ученика
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
         ctx.reply(msg, null, Markup.keyboard(newKeybord(buttons)).oneTime())
      } else {
         ctx.reply(`No`, kbd.menu)
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         ctx.scene.next()
         let payload = JSON.parse(ctx.message.payload)
         ctx.session.coachId = payload
         const coach = await Coach.findOne({ coach_id: payload })
         ctx.reply(`Теперь ${coach.full_name} твой тренер\nВы уверены?`, null, kbd.confirmBtns)
      } else {
         mistake(ctx, 'accept_invite')
      }
   },
   async (ctx) => {
      ctx.scene.leave()
      if (ctx.message.payload) {
         let payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               await Padavan.deleteOne({ ren_login: ctx.session.ren_login })
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
                  'Отлично!\n\nВ процессе тебе предстоит пролететь на ракете планеты:\n\nпланета - ПРОДУКТЫ. Здесь ты узнаешь те продукты, которые продаются в нашем космическом пространстве и их основные параметры.\n\nпланета - КОММУНИКАТИВ. На этой горячей планете тебя ждут основы общения с клиентом и то, что нужно использовать для наиболее эффективной продажи.\n\nпланета - ПРОГРАММЫ. В гостях у этой планеты ты узнаешь на какую кнопку нужно нажать, чтобы узнать решение банка и записать клиента в офис.\n\nКак твой настрой?\nГотов к незабываемым приключениям?'
               )
               break
            case 'no':
               ctx.scene.enter('accept_invite')
               break
         }
      } else {
         mistake(ctx, 'accept_invite')
      }
   }
)

module.exports = {
   inviteCodeScene: inviting,
}
