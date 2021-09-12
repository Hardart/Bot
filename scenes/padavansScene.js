const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Coach, Padavan } = require('../mongoModels')
const kbd = require('../keyboards')
const query = require('../query')
const { newKeybord, mistake } = require('../functions')

const addP = new Scene( // добавить ученика
   'addPadavan',
   (ctx) => {
      ctx.scene.next()
      ctx.reply('Напиши имя нового падавана')
   },
   (ctx) => {
      ctx.session.name = ctx.message.text
      ctx.reply(
         'Введи Ren_login падавана (напиши только цифры логина,\nпрефикс trainCC будет добавлен автоматически)'
      )
      ctx.scene.next()
   },
   (ctx) => {
      ctx.session.login = 'trainCC_' + ctx.message.text
      ctx.reply('Введи ВК-ID падавана (он должен состоять только из цифр)')
      ctx.scene.next()
   },
   async (ctx) => {
      let str = ctx.message.text
      if (str.match(/^\d+$/)) {
         ctx.scene.next()
         ctx.session.vkid = ctx.message.text
         const [coaches] = await query.selectAll(Coach)
         ctx.reply('Назначить тренера', null, Markup.keyboard(newKeybord(coaches)).oneTime())
      } else {
         ctx.reply('VK-ID должен состоять только из цифр')
         ctx.scene.enter('addPadavan', 2)
      }
   },
   (ctx) => {
      ctx.scene.next()
      ctx.session.coach = ctx.message.payload
      ctx.reply(
         `Имя - ${ctx.session.name},\nVK_id - ${ctx.session.vkid},\nЛогин - ${ctx.session.login},\nТренер - ${ctx.message.text}\nдобавить в список учеников?`,
         null,
         kbd.confirmBtns
      )
   },
   (ctx) => {
      ctx.scene.leave()
      if (ctx.message.payload) {
         const payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               query.add(
                  'padavans',
                  ctx.session.vkid,
                  ctx.session.name,
                  ctx.session.login,
                  ctx.session.coach
               )
               ctx.reply('Готово!', null, kbd.mainMenu)
               break
            case 'no':
               ctx.reply('Выбери действие', null, kbd.padavanMenu)
               break
            case 'stepBack':
               ctx.scene.enter('addPadavan', 0)
               break
         }
      } else {
         ctx.reply('Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры, начнём заново')
         ctx.scene.enter('addPadavan', 0)
      }
   }
)

const delP = new Scene( // удалить ученика
   'deletePadavan',
   async (ctx) => {
      const [buttons, padavans] = await query.selectAll(Padavan)
      if (padavans.length == 0) {
         ctx.scene.leave()
         ctx.reply('Список учеников пуст', null, kbd.padavanMenu)
      } else {
         ctx.session.users = padavans
         let list = ''
         ctx.scene.next()
         padavans.forEach((pad) => {
            list += `${pad.full_name} - ${pad.ren_login}\n`
         })
         ctx.reply(
            `Выберите кого хочешь удалить\n${list}`,
            null,
            Markup.keyboard(newKeybord(buttons)).oneTime()
         )
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         let payload = JSON.parse(ctx.message.payload)
         if (payload.button) {
            ctx.scene.next()
            ctx.session.ren_login = payload.button
            let user = ctx.session.users[payload.id]
            ctx.reply(
               `Ученик:\nЛогин - ${ctx.session.ren_login},\nИмя - ${user.full_name}\nбудет удалён.\nВы уверены?`,
               null,
               kbd.confirmBtns
            )
         } else {
            ctx.reply('Выбери действие', null, kbd.padavanMenu)
            ctx.scene.leave()
         }
      } else {
         mistake(ctx, 'deletePadavan')
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         ctx.scene.leave()
         let payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               await Padavan.deleteOne({ ren_login: ctx.session.ren_login })
               ctx.reply(`Ученик с логином ${ctx.session.ren_login} удалён`)
               setTimeout(() => {
                  ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               }, 2000)
               break
            case 'no':
               ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               break
         }
      } else {
         mistake(ctx, 'deletePadavan')
      }
   }
)

const clean = new Scene( // сбросить данные
   'clearData',
   (ctx) => {
      query.selectAll('padavans').then(([data, users]) => {
         if (users.length == 0) {
            ctx.scene.leave()
            ctx.reply('Список учеников пуст', null, kbd.padavanMenu)
         } else {
            let list = ''
            users.forEach((user) => {
               list += `${user.full_name} - ${user.ren_login}\n`
            })
            ctx.reply(
               `Выберите ученика, кому небоходимо сбросить все набранные баллы\n${list}`,
               null,
               Markup.keyboard(newKeybord(data)).oneTime()
            )
            ctx.scene.next()
         }
      })
   },
   (ctx) => {
      if (ctx.message.payload) {
         let payload = JSON.parse(ctx.message.payload)
         if (payload.button) {
            ctx.scene.next()
            ctx.session.payload = payload.button
            ctx.reply(
               `Баллы ученика с логином ${ctx.session.payload} будут сброшены\nВы уверены?`,
               null,
               kbd.confirmBtns
            )
         } else {
            ctx.scene.leave()
            ctx.reply('Вы вернулись в настройки учеников', null, kbd.padavanMenu)
         }
      } else {
         ctx.scene.leave()
         ctx.scene.enter('deletePadavan', 0)
      }
   },
   (ctx) => {
      if (ctx.message.payload) {
         let payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               ctx.scene.leave()
               query.resetPoints(ctx.session.payload)
               ctx.reply(`Баллы сброшены`)
               setTimeout(() => {
                  ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               }, 2000)
               break
            case 'no':
               ctx.scene.leave()
               ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               break
            case 'stepBack':
               ctx.scene.enter('clearData', 0)
               break
            default:
               break
         }
      } else {
         console.log(ctx.scene.step)
         ctx.reply('Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры')
         ctx.scene.enter('clearData', 1)
      }
   }
)

const sendToCoach = new Scene( // отправить к другому тренеру - DONE
   'sendToCoach',
   async (ctx) => {
      const [buttons, padavans] = await query.selectAll(Padavan)
      if (padavans.length == 0) {
         ctx.reply(`Учеников нет...`, null, kbd.padavanMenu)
         ctx.scene.leave()
      } else {
         let list = ''
         padavans.forEach((user) => {
            list += `${user.full_name} - ${user.ren_login}\n`
         })
         ctx.reply(
            `Выберите ученика, которого необходимо отправить к другому тренеру\n${list}`,
            null,
            Markup.keyboard(newKeybord(buttons)).oneTime()
         )
         ctx.scene.next()
      }
   },
   async (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'sendToCoach')
      } else {
         ctx.scene.next()
         let payload = JSON.parse(ctx.message.payload)
         if (payload.button) {
            ctx.session.ren_login = payload.button
            const [buttons, coaches] = await query.selectAll(Coach, {
               coach_id: 1,
            })
            ctx.session.array = coaches
            ctx.reply(
               `Выберите к какому тренеру необходимо отправить`,
               null,
               Markup.keyboard(newKeybord(buttons)).oneTime()
            )
         } else {
            ctx.scene.leave()
            ctx.reply('Выбери действие', null, kbd.padavanMenu)
         }
      }
   },
   async (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'sendToCoach')
      } else if (JSON.parse(ctx.message.payload).value == 'cancel') {
         ctx.scene.leave()
         ctx.reply('Выбери действие', null, kbd.padavanMenu)
      } else {
         ctx.scene.next()
         let coachId = JSON.parse(ctx.message.payload) - 1
         ctx.reply(
            `Ученику с логином ${ctx.session.ren_login} будет назначен\nновый тренер - ${ctx.session.array[coachId].full_name}, вы уверены?`,
            null,
            kbd.confirmBtns
         )
      }
   },
   async (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'sendToCoach')
      } else {
         ctx.scene.leave()
         let payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               await query.change(
                  Padavan,
                  { ren_login: ctx.session.ren_login },
                  { coach_id: ctx.session.coach }
               )
               ctx.reply(`Готово...`)
               setTimeout(() => {
                  ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               }, 2000)
               break
            case 'no':
               ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               break
            case 'stepBack':
               ctx.scene.enter('sendToCoach', 0)
               break
            default:
               break
         }
      }
   }
)

module.exports = {
   deletePadavan: delP,
   addPadavan: addP,
   cleanPoints: clean,
   send: sendToCoach,
}
