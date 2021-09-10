const Markup = require('node-vk-bot-api/lib/markup')

const mainMenu = Markup.keyboard([
   [
      Markup.button('Настройка учеников', 'secondary', {
         value: 'padavan_config',
      }),
   ],
   [
      Markup.button('Настройки тренеров', 'secondary', {
         value: 'coach_config',
      }),
   ],
   [
      Markup.button('Настройки тестов', 'secondary', {
         value: 'test_config',
      }),
   ],
]).oneTime()

const coachMenu = Markup.keyboard([
   [Markup.button('Добавить тренера', 'positive', { value: 'add_coach' })],
   [Markup.button('Изменить тренера', 'primary', { value: 'change_coach' })],
   [Markup.button('Удалить тренера', 'secondary', { value: 'delete_coach' })],
   [Markup.button('Назад', 'negative', { value: 'main_menu' })],
]).oneTime()

const padavanMenu = Markup.keyboard([
   [Markup.button('Сбросить данные', 'positive', { value: 'clear_data' })],
   [Markup.button('Назначить тренера', 'primary', { value: 'send_to_coach' })],
   [
      Markup.button('Добавить ученика (временно)', 'primary', {
         value: 'add_padavan',
      }),
   ],
   [Markup.button('Удалить ученика', 'secondary', { value: 'delete_padavan' })],
   [Markup.button('Назад', 'negative', { value: 'main_menu' })],
]).oneTime()

const testMenu = Markup.keyboard([
   [Markup.button('Добавить тест', 'positive', { value: 'add_test' })],
   [Markup.button('Изменть тест', 'primary', { value: 'change_test' })],
   [Markup.button('Удалить тест', 'secondary', { value: 'delete_test' })],
   [Markup.button('Назад', 'negative', { value: 'main_menu' })],
]).oneTime()

const confirmBtns = Markup.keyboard([
   [Markup.button('Назад', 'negative', { value: 'stepBack' })],
   [
      Markup.button('Да', 'positive', { value: 'yes' }),
      Markup.button('Отмена', 'secondary', { value: 'no' }),
   ],
]).oneTime()

const points = Markup.keyboard([
   [
      Markup.button('3', 'primary', { value: '3' }),
      Markup.button('4', 'primary', { value: '4' }),
      Markup.button('5', 'primary', { value: '5' }),
   ],
   [Markup.button('Назад', 'negative', { value: 'stepBack' })],
]).oneTime()

module.exports = {
   mainMenu: mainMenu,
   coachMenu: coachMenu,
   padavanMenu: padavanMenu,
   testMenu: testMenu,
   confirmBtns: confirmBtns,
   points: points,
   backAction: Markup.keyboard([
      Markup.button('Отменить', 'negative', { value: 'cancel' }),
   ]).oneTime(),
}
