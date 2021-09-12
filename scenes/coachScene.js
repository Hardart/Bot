const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Coach } = require('../mongoModels')
const kbd = require('../keyboards')
const query = require('../query')
const { newKeybord, mistake } = require('../functions')

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
      if (ctx.message.payload) {
         const payload = JSON.parse(ctx.message.payload)
         if (payload.value == 'cancel') {
            ctx.scene.leave()
            ctx.reply('Выберите действие', null, kbd.coachMenu)
         } else {
            ctx.scene.next()
            ctx.session.payload = payload
            ctx.session.oldName = ctx.message.text
            ctx.reply('Напиши полное фамилию и имя нового тренера')
         }
      } else {
         mistake(ctx, 'changeCoach')
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
      if (str.match(/^\d+$/)) {
         ctx.scene.next()
         ctx.reply(
            `Изменения:\n${ctx.session.oldName} -> ${ctx.session.name},\nID - ${ctx.session.id}`,
            null,
            kbd.confirmBtns
         )
      } else {
         ctx.scene.enter('changeCoach', [ctx.scene.step - 2])
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

module.exports = {
   addCoach: addC,
   deleteCoach: delC,
   changeCoach: changeC,
}
