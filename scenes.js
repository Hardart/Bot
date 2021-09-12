const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Coach, Padavan, Test } = require('./mongoModels')
const kbd = require('./keyboards')
const query = require('./query')
const { newKeybord, mistake } = require('./functions')

function isNumber(val) {
   return typeof val === 'number'
}

const addC = new Scene( // добавить тренера
   'addCoach',
   (ctx) => {
      ctx.scene.next()
      ctx.reply('Напиши полное фамилию и имя нового тренера', null, kbd.backAction)
   },
   (ctx) => {
      ctx.session.name = ctx.message.text
      if (ctx.message.payload) {
         ctx.reply('Выбери действие', null, kbd.coachMenu)
         ctx.scene.leave()
      } else {
         ctx.scene.next()
         ctx.reply('Введи ВК-ID тренера (он должен состоять только из цифр)', null, kbd.backAction)
      }
   },
   (ctx) => {
      let str = ctx.message.text
      if (ctx.message.payload) {
         ctx.scene.next()
         ctx.reply('Выбери действие', null, kbd.coachMenu)
      } else {
         if (str.match(/^\d+$/)) {
            ctx.scene.next()
            ctx.session.id = ctx.message.text
            ctx.reply(
               `Имя - ${ctx.session.name},\nVK_id - ${ctx.session.id},\nдобавить в список тренеров?`,
               null,
               kbd.confirmBtns
            )
         } else {
            ctx.reply(
               'VK_id должен состоять только из цифр!\nВведи id заново.',
               null,
               kbd.backAction
            )
            ctx.scene.enter('addCoach', [1])
         }
      }
   },
   (ctx) => {
      ctx.scene.leave()
      const payload = JSON.parse(ctx.message.payload)
      switch (payload.value) {
         case 'yes':
            query.add('coaches', ctx.session.name, ctx.session.id)
            ctx.reply('Готово!', null, kbd.mainMenu)
            break
         case 'no':
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
            break
         case 'stepBack':
            ctx.scene.enter('addCoach')
            break
      }
   }
)

const delC = new Scene( // удалить тренера
   'deleteCoach',
   async (ctx) => {
      ctx.scene.next()
      const [coaches] = await query.selectAll(Coach)
      ctx.reply('Кого необходимо удалить?', null, Markup.keyboard(newKeybord(coaches)).oneTime())
   },
   async (ctx) => {
      const payload = JSON.parse(ctx.message.payload)
      if (payload.value == 'cancel') {
         ctx.scene.leave()
         ctx.reply('Выбери действие', null, kbd.coachMenu)
      } else {
         ctx.scene.next()
         ctx.session.id = payload
         ctx.session.name = ctx.message.text
         ctx.reply(
            `Тренер с именем ${ctx.session.name} будет удалён\nВы уверены?`,
            null,
            kbd.confirmBtns
         )
      }
   },
   async (ctx) => {
      const payload = JSON.parse(ctx.message.payload)
      ctx.scene.leave()
      switch (payload.value) {
         case 'yes':
            //   query.delete(ctx.session.id, 'coaches', 'id')
            await Coach.deleteOne({ coach_id: 8 })
            ctx.reply('Готово!', null, kbd.mainMenu)
            break
         case 'no':
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
            break
         case 'stepBack':
            ctx.scene.enter('deleteCoach')
            break
      }
   }
)

const changeC = new Scene( // изменить тренера
   'changeCoach',
   async (ctx) => {
      ctx.scene.next()
      const [coaches] = await query.selectAll(Coach)
      ctx.reply('Кого необходимо изменить?', null, Markup.keyboard(newKeybord(coaches)).oneTime())
   },
   (ctx) => {
      if (ctx.message.payload && isNumber(JSON.parse(ctx.message.payload))) {
         ctx.scene.next()
         ctx.session.payload = JSON.parse(ctx.message.payload)
         ctx.session.oldName = ctx.message.text
         ctx.reply('Напиши полное фамилию и имя нового тренера')
      } else if (JSON.parse(ctx.message.payload).value == 'cancel') {
         ctx.reply('Выберите действие', null, kbd.coachMenu)
         ctx.scene.leave()
      } else {
         ctx.scene.leave()
         ctx.scene.enter('changeCoach', 0)
      }
   },
   (ctx) => {
      ctx.scene.next()
      if (!ctx.message.payload) {
         ctx.session.name = ctx.message.text
      }
      ctx.reply('Введи ВК-ID тренера (он должен состоять только из цифр)', null, kbd.backAction)
   },
   (ctx) => {
      let str = ctx.message.text
      ctx.session.id = ctx.message.text
      if (ctx.message.payload) {
         ctx.scene.enter('changeCoach', [1])
      } else {
         if (str.match(/^\d+$/)) {
            ctx.scene.next()
            ctx.reply(
               `Изменения:\n${ctx.session.oldName} -> ${ctx.session.name},\nID - ${ctx.session.id}`,
               null,
               kbd.confirmBtns
            )
         } else {
            ctx.scene.enter('changeCoach', [2])
         }
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         let pld = JSON.parse(ctx.message.payload)
         switch (pld.value) {
            case 'yes':
               ctx.scene.leave()
               await query.change(
                  Coach,
                  { coach_id: ctx.session.payload },
                  { vk_id: ctx.session.id, full_name: ctx.session.name }
               )
               ctx.reply('Готово', null, kbd.mainMenu)
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
)

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
            `Выберите ученика\n${list}`,
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
            ctx.session.payload = payload.button
            let user = ctx.session.users[payload.id]
            ctx.reply(
               `Ученик:\nЛогин - ${ctx.session.payload},\nИмя - ${user.full_name}\nбудет удалён.\nВы уверены?`,
               null,
               kbd.confirmBtns
            )
         } else {
            ctx.reply('Выбери действие', null, kbd.padavanMenu)
            ctx.scene.leave()
         }
      } else {
         ctx.scene.leave()
         ctx.scene.enter('deletePadavan', 0)
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         ctx.scene.leave()
         let payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               try {
                  await Padavan.deleteOne({ ren_login: ctx.session.payload })
               } catch (e) {
                  console.log(e)
               }
               ctx.reply(`Ученик с логином ${ctx.session.payload} удалён`)
               setTimeout(() => {
                  ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               }, 2000)
               break
            case 'no':
               ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               break
            case 'stepBack':
               ctx.scene.enter('deletePadavan', 0)
               break
         }
      } else {
         console.log(ctx.scene.step)
         ctx.reply('Необходимо нажимать кнопки, я не понимаю ввод с клавиатуры')
         ctx.scene.enter('deletePadavan', 1)
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

const addT = new Scene( // добавить тест
   'addTest',
   (ctx) => {
      ctx.scene.next()
      ctx.reply('Укажи префикс для теста', null, kbd.prefix)
   },
   (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'changeTest')
      } else {
         let pld = JSON.parse(ctx.message.payload)
         if (pld.value) {
            ctx.scene.leave()
            ctx.reply('Выбери действие', null, kbd.testMenu)
         } else {
            ctx.scene.next()
            ctx.session.prefix = ctx.message.payload
            ctx.reply('Напиши название теста', null, kbd.backAction)
         }
      }
   },
   (ctx) => {
      if (!ctx.message.payload) {
         ctx.scene.next()
         ctx.session.title = ctx.message.text
         ctx.reply(
            'Укажи сколько баллов получит ученик за прохождение данного теста',
            null,
            kbd.points
         )
      } else {
         ctx.reply('Выбери действие', null, kbd.testMenu)
         ctx.scene.leave()
      }
   },
   (ctx) => {
      if (!ctx.message.payload) {
         ctx.scene.next()
         ctx.reply('Выбери действие', null, kbd.coachMenu)
      } else {
         let payload = JSON.parse(ctx.message.payload)
         ctx.scene.next()
         ctx.session.points = payload
         ctx.reply(
            `Тест:\n${ctx.session.prefix}_${ctx.session.title},\nБаллы за прохождение - ${ctx.session.points},\nдобавить тест в базу данных?`,
            null,
            kbd.confirmBtns
         )
      }
   },
   (ctx) => {
      ctx.scene.leave()
      const payload = JSON.parse(ctx.message.payload)
      switch (payload.value) {
         case 'yes':
            query.add('tests', ctx.session.title, ctx.session.prefix, ctx.session.points)
            ctx.reply('Готово!', null, kbd.mainMenu)
            break
         case 'no':
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
            break
         case 'stepBack':
            ctx.scene.enter('addTest')
            break
      }
   }
)

const delT = new Scene( // удалить тест
   'deleteTest',
   async (ctx) => {
      ctx.scene.next()
      const [tests] = await query.selectAll(Test)
      ctx.reply('Кого необходимо удалить?', null, Markup.keyboard(newKeybord(tests)).oneTime())
   },
   async (ctx) => {
      const payload = JSON.parse(ctx.message.payload)
      if (payload.value == 'cancel') {
         ctx.scene.leave()
         ctx.reply('Выбери действие', null, kbd.testMenu)
      } else {
         ctx.scene.next()
         ctx.session.id = payload
         ctx.session.title = ctx.message.text
         ctx.reply(
            `Тест под названием ${ctx.session.title} будет удалён\nВы уверены?`,
            null,
            kbd.confirmBtns
         )
      }
   },
   async (ctx) => {
      const payload = JSON.parse(ctx.message.payload)
      ctx.scene.leave()
      switch (payload.value) {
         case 'yes':
            //   query.delete(ctx.session.id, 'coaches', 'id')
            await Test.deleteOne({ _id: ctx.session.id })
            ctx.reply('Готово!', null, kbd.mainMenu)
            break
         case 'no':
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
            break
         case 'stepBack':
            ctx.scene.enter('deleteCoach')
            break
      }
   }
)

const changeT = new Scene( // изменить тест
   'changeTest',
   async (ctx) => {
      ctx.scene.next()
      const [tests] = await query.selectAll(Test)
      if (tests.length == 0) {
         ctx.reply(`В списке тестов пусто...`, null, kbd.testMenu)
      } else {
         ctx.reply(
            'Выбери тест, который необходимо изменить?',
            null,
            Markup.keyboard(newKeybord(tests)).oneTime()
         )
      }
   },
   (ctx) => {
      if (ctx.message.payload) {
         if (JSON.parse(ctx.message.payload).value == 'cancel') {
            ctx.reply('Выберите действие', null, kbd.testMenu)
            ctx.scene.leave()
         } else {
            ctx.scene.next()
            ctx.session.id = JSON.parse(ctx.message.payload)
            ctx.session.oldName = ctx.message.text
            ctx.reply('Напиши новый префикс теста (ИТ, ДТ...)', null, kbd.backAction)
         }
      } else {
         mistake(ctx, 'changeTest')
      }
   },
   (ctx) => {
      if (ctx.message.payload) {
         ctx.reply('Изменения отменены', null, kbd.testMenu)
         ctx.scene.leave()
      } else {
         ctx.scene.next()
         ctx.session.prefix = ctx.message.text
         ctx.reply(
            `Сейчас название теста - ${ctx.session.oldName}\nНапиши как ты хочешь его изменить`,
            null,
            kbd.backAction
         )
      }
   },
   (ctx) => {
      ctx.session.title = ctx.message.text
      if (ctx.message.payload) {
         ctx.reply('Изменения отменены', null, kbd.testMenu)
         ctx.scene.leave()
      } else {
         ctx.scene.next()
         ctx.reply(`Укажи сколько баллов будем начислять за новый тест`, null, kbd.points)
      }
   },
   (ctx) => {
      if (!ctx.message.payload) {
         ctx.scene.leave()
         ctx.reply(
            `Если написано "Укажи..." значит нужно выбрать один из предложенных вариантов\nСейчас начнём сначала...`
         )
         setTimeout(() => {
            ctx.scene.enter('changeTest', 0)
         }, 4000)
      } else {
         ctx.scene.next()
         ctx.session.points = JSON.parse(ctx.message.payload)
         ctx.reply(
            `Новый тест - ${ctx.session.prefix}_${ctx.session.title}\nБаллы за тест - ${ctx.session.points}\nОбновить информацию в базе данных?`,
            null,
            kbd.confirmBtns
         )
      }
   },
   async (ctx) => {
      if (ctx.message.payload) {
         let pld = JSON.parse(ctx.message.payload)
         switch (pld.value) {
            case 'yes':
               ctx.scene.leave()
               await query.change(
                  Test,
                  { _id: ctx.session.id },
                  {
                     title: ctx.session.title,
                     prefix: ctx.session.prefix,
                     points: ctx.session.points,
                  }
               )
               ctx.reply('Готово', null, kbd.mainMenu)
               break
            case 'no':
               ctx.scene.leave()
               ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               break
            case 'stepBack':
               ctx.scene.enter('changeTest', [ctx.scene.step - 2])
               break
         }
      }
   }
)

module.exports = {
   addCoach: addC,
   deleteCoach: delC,
   changeCoach: changeC,
   deletePadavan: delP,
   addPadavan: addP,
   cleanPoints: clean,
   send: sendToCoach,
   addTest: addT,
   deleteTest: delT,
   changeTest: changeT,
}
