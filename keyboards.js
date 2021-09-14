const Markup = require('node-vk-bot-api/lib/markup')

const back = Markup.button('Назад', 'negative', {
   value: 'stepBack',
})

const cancel = Markup.button('Отменить', 'negative', {
   value: 'cancel',
})

const mainMenu = Markup.keyboard([
   [Markup.button('Настройка учеников', 'secondary', { value: 'padavan_config' })],
   [Markup.button('Настройки тренеров', 'secondary', { value: 'coach_config' })],
   [Markup.button('Настройки тестов', 'secondary', { value: 'test_config' })],
]).oneTime()

const menu = Markup.keyboard([
   [Markup.button('Турнирная таблица', 'primary', { value: 'score_table' })],
   [Markup.button('Бонус', 'secondary', { value: 'bonus' })],
   [Markup.button('Очистить список учеников', 'secondary', { value: 'clean_list' })],
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
   [Markup.button('Добавить ученика (временно)', 'primary', { value: 'add_padavan' })],
   [Markup.button('Удалить ученика', 'secondary', { value: 'delete_padavan' })],
   [Markup.button('Назад', 'negative', { value: 'main_menu' })],
]).oneTime()

const padavanMainMenu = Markup.keyboard([
   [Markup.button('Турнирная таблица', 'primary', { value: 'score_table' })],
   [Markup.button('Задать вопрос тренеру', 'secondary', { value: 'send_question' })],
]).oneTime()

const testMenu = Markup.keyboard([
   [Markup.button('Добавить тест', 'positive', { value: 'add_test' })],
   [Markup.button('Изменть тест', 'primary', { value: 'change_test' })],
   [Markup.button('Удалить тест', 'secondary', { value: 'delete_test' })],
   [Markup.button('Назад', 'negative', { value: 'main_menu' })],
]).oneTime()

const confirmBtns = Markup.keyboard([
   [
      Markup.button('Да', 'positive', { value: 'yes' }),
      Markup.button('Нет', 'negative', { value: 'no' }),
   ],
]).oneTime()

const points = Markup.keyboard([
   [
      Markup.button('3', 'primary', 3),
      Markup.button('4', 'primary', 4),
      Markup.button('5', 'primary', 5),
   ],
   [back],
]).oneTime()

const prefix = Markup.keyboard([
   [Markup.button('ИТ', 'primary', 'it'), Markup.button('ДТ', 'primary', 'dt')],
   [back],
]).oneTime()

module.exports = {
   mainMenu: mainMenu,
   menu: menu,
   coachMenu: coachMenu,
   padavanMenu: padavanMenu,
   padavanMainMenu: padavanMainMenu,
   testMenu: testMenu,
   confirmBtns: confirmBtns,
   points: points,
   prefix: prefix,
   cancel: Markup.keyboard([cancel]).oneTime(),
   backAction: Markup.keyboard([back]).oneTime(),
}
