const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const kbd = require('./keyboards')
const { sendRequest, newKeybord } = require('./functions')
const url = 'http://robb-i.ru/php_bot/post.php'

function isNumber(val) {
   return typeof val === 'number'
}

module.exports = {
   addCoach: new Scene(
      'addCoach',
      (ctx) => {
         ctx.scene.next()
         ctx.reply('Напиши полное фамилию и имя нового тренера')
      },
      (ctx) => {
         ctx.session.name = ctx.message.text

         ctx.scene.next()
         ctx.reply('Теперь введи ВК-ID тренера')
      },
      (ctx) => {
         console.log(isNumber(ctx.message.text))
         if (isNumber(ctx.message.text)) {
            ctx.scene.next()
            ctx.session.id = ctx.message.text
            ctx.reply(
               `Имя - ${ctx.session.name},\nVK_id - ${ctx.session.id},\nдобавить в список тренеров?`,
               null,
               kbd.confirmBtns()
            )
         } else {
            ctx.scene.enter('addCoach', [1])
            ctx.reply(
               'VK_id должен состоять только из цифр!',
               null,
               kbd.backAction
            )
         }
      },
      (ctx) => {
         ctx.scene.leave()
         const payload = JSON.parse(ctx.message.payload)
         const body = {
            value: 'add_coach',
            coach_name: ctx.session.name,
            coach_id: ctx.session.id,
         }
         if (payload.add_coach == 'yes') {
            sendRequest('POST', url, body).then((data) => {
               ctx.reply(data)
            })
         } else {
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
         }
      }
   ),
   deleteCoach: new Scene(
      'deleteCoach',
      (ctx) => {
         console.log(ctx.scene.step)
         ctx.scene.next()
         sendRequest('POST', url, { value: 'show_all_coaches' }).then(
            (data) => {
               ctx.reply(
                  'Кого необходимо удалить?',
                  null,
                  Markup.keyboard(newKeybord(data, 2)).oneTime()
               )
            }
         )
      },
      (ctx) => {
         const payload = JSON.parse(ctx.message.payload)
         ctx.session.id = payload
         ctx.session.name = ctx.message.text
         ctx.scene.next()
         ctx.reply(
            `Тренер с именем ${ctx.session.name} будет удалён\nВы уверены?`,
            null,
            kbd.confirmBtns()
         )
      },
      (ctx) => {
         const payload = JSON.parse(ctx.message.payload)
         ctx.scene.leave()
         let body = {
            value: 'delete_coach',
            coach_id: ctx.session.id,
            coach_name: ctx.session.name,
         }
         if (payload.add_coach == 'yes') {
            sendRequest('POST', url, body).then((data) => {
               ctx.reply(data, null, kbd.mainMenu)
            })
         } else {
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
         }
      }
   ),
   changeCoach: new Scene(
      'changeCoach',
      (ctx) => {
         ctx.scene.next()
         sendRequest('POST', url, { value: 'show_all_coaches' }).then(
            (data) => {
               let body = {
                  value: 'coach',
               }
               ctx.reply(
                  'Кого необходимо изменить?',
                  null,
                  Markup.keyboard(newKeybord(data, 2, body)).oneTime()
               )
            }
         )
      },
      (ctx) => {
         ctx.scene.next()
         if (isNumber(JSON.parse(ctx.message.payload))) {
            ctx.session.payload = JSON.parse(ctx.message.payload)
            ctx.session.oldName = ctx.message.text
         }
         ctx.reply('Напиши полное фамилию и имя нового тренера')
      },
      (ctx) => {
         ctx.scene.next()
         if (!ctx.message.payload) {
            ctx.session.name = ctx.message.text
         }
         ctx.reply('Теперь введи ВК-ID тренера', null, kbd.backAction)
      },
      (ctx) => {
         let step = ctx.scene.step
         ctx.scene.next()
         ctx.session.id = ctx.message.text
         if (ctx.message.payload) {
            ctx.scene.enter('changeCoach', [step - 2])
         } else {
            ctx.reply(
               `Изменения:\n${ctx.session.oldName} -> ${ctx.session.name},\nID - ${ctx.session.id}`,
               null,
               kbd.confirmBackBtns
            )
         }
      },
      (ctx) => {
         let body = {
            value: 'update_coaches',
            coach_id: ctx.session.payload,
            old_name: ctx.session.oldName,
            coach_name: ctx.session.name,
            coach_vk_id: +ctx.session.id,
         }
         if (ctx.message.payload) {
            let pld = JSON.parse(ctx.message.payload)
            switch (pld.value) {
               case 'yes':
                  console.log(body)
                  ctx.scene.leave()
                  ctx.reply('Готово', null, kbd.mainMenu)
                  // sendRequest('POST', url, body).then((data) => {
                  //   ctx.reply(data)
                  // })
                  break
               case 'no':
                  ctx.scene.leave()
                  ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
                  break
               case 'stepBack':
                  ctx.scene.enter('changeCoach', [ctx.scene.step - 2])
                  break
            }
         }
      }
   ),
}
