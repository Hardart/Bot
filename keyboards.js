const Markup = require('node-vk-bot-api/lib/markup')

const mainMenu = Markup.keyboard([
   [
      Markup.button('Настройка учеников', 'secondary', {
         value: 'student_config',
      }),
   ],
   [
      Markup.button('Настройки тренеров', 'secondary', {
         value: 'coach_config',
      }),
   ],
]).oneTime()

const coachMenu = Markup.keyboard([
   [Markup.button('Добавить тренера', 'positive', { value: 'add_coach' })],
   [Markup.button('Изменить тренера', 'primary', { value: 'change_coach' })],
   [Markup.button('Удалить тренера', 'negative', { value: 'delete_coach' })],
]).oneTime()

const confirmBtns = Markup.keyboard([
   [Markup.button('Назад', 'negative', { value: 'stepBack' })],
   [
      Markup.button('Да', 'positive', { value: 'yes' }),
      Markup.button('Отмена', 'negative', { value: 'no' }),
   ],
]).oneTime()

module.exports = {
   mainMenu: mainMenu,
   coachMenu: coachMenu,
   confirmBtns: confirmBtns,
   backAction: Markup.keyboard([
      Markup.button('Назад', 'negative', { value: 'stepBack' }),
   ]).oneTime(),
}
