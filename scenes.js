const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const url = 'http://robb-i.ru/php_bot/post.php'

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
      ctx.session.id = ctx.message.text
      ctx.scene.next()
      ctx.reply(
        `Имя - ${ctx.session.name},\nVK_id - ${ctx.session.id},\nдобавить в список тренеров?`,
        null,
        kbd.confirmBtns()
      )
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
        ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu())
      }
    }
  ),
  deleteCoach: new Scene(
    'deleteCoach',
    (ctx) => {
      ctx.scene.next()
      sendRequest('POST', url, { value: 'show_all_coaches' }).then((data) => {
        ctx.reply(
          'Кого необходимо удалить?',
          null,
          Markup.keyboard(newKeybord(data, 2)).oneTime()
        )
      })
    },
    (ctx) => {
      const payload = JSON.parse(ctx.message.payload)
      ctx.session.id = payload
      ctx.session.name = ctx.message.text
      console.log(payload)
      ctx.scene.next()
      ctx.reply(
        `Тренер с именем ${ctx.session.name} будет удалён\nВы увенерены?`,
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
          ctx.reply(data)
        })
      } else {
        ctx.reply('Вы вернулись в главное меню', null, kbd.mainMenu())
      }
    }
  ),
  changeCoach: new Scene(
    'changeCoach',
    (ctx) => {
      ctx.scene.next()
      sendRequest('POST', url, { value: 'show_all_coaches' }).then((data) => {
        let body = {
          value: 'coach',
        }
        ctx.reply(
          'Кого необходимо изменить?',
          null,
          Markup.keyboard(newKeybord(data, 2, body)).oneTime()
        )
      })
    },
    (ctx) => {
      const payload = JSON.parse(ctx.message.payload)
      ctx.session.payload = payload
      ctx.session.oldName = ctx.message.text
      ctx.scene.next()
      ctx.reply('Напиши полное фамилию и имя нового тренера')
    },
    (ctx) => {
      ctx.session.name = ctx.message.text
      ctx.scene.next()
      ctx.reply('Теперь введи ВК-ID тренера')
    },
    (ctx) => {
      ctx.scene.leave()

      let body = {
        value: 'update_coaches',
        coach_vk_id: +ctx.message.text,
        coach_name: ctx.session.name,
        coach_id: ctx.session.payload,
      }

      sendRequest('POST', url, body).then((data) => {
        ctx.reply(data)
      })
    }
  ),
}
