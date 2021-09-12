const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Test } = require('../mongoModels')
const kbd = require('../keyboards')
const query = require('../query')
const { newKeybord, mistake } = require('../functions')

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
            ctx.session.prefix = ctx.message.text
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
         ctx.scene.leave()
         ctx.reply('Выбери действие', null, kbd.testMenu)
      }
   },
   (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'addTest')
      } else {
         ctx.scene.next()
         let payload = JSON.parse(ctx.message.payload)
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
      if (!ctx.message.payload) {
         mistake(ctx, 'deleteTest')
      } else {
         const payload = JSON.parse(ctx.message.payload)
         if (payload.value == 'cancel') {
            ctx.scene.leave()
            ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
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
      }
   },
   async (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'deleteTest')
      } else {
         ctx.scene.leave()
         const payload = JSON.parse(ctx.message.payload)
         switch (payload.value) {
            case 'yes':
               await Test.deleteOne({ _id: ctx.session.id })
               ctx.reply('Готово!', null, kbd.mainMenu)
               break
            case 'no':
               ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu)
               break
         }
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
            ctx.reply('Укажи новый префикс теста', null, kbd.prefix)
         }
      } else {
         mistake(ctx, 'changeTest')
      }
   },
   (ctx) => {
      if (!ctx.message.payload) {
         mistake(ctx, 'changeTest')
      } else {
         if (JSON.parse(ctx.message.payload).value == 'stepBack') {
            ctx.scene.enter('changeTest', 0)
         } else {
            ctx.scene.next()
            ctx.session.prefix = ctx.message.text
            ctx.reply(`Напиши новое название теста`, null, kbd.backAction)
         }
      }
   },
   (ctx) => {
      if (ctx.message.payload) {
         ctx.scene.enter('changeTest', [1])
      } else {
         ctx.scene.next()
         ctx.session.title = ctx.message.text
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
         }
      }
   }
)

module.exports = {
   addTest: addT,
   deleteTest: delT,
   changeTest: changeT,
}
