const Markup = require('node-vk-bot-api/lib/markup')



module.exports = {
   mainMenu: function() {
      return Markup
         .keyboard([
            [Markup.button('Настройки учеников', 'secondary', {value: 'student_config'})],
            [Markup.button('Настройки тренеров', 'secondary', {value: 'coach_config'})]
         ])
         .oneTime()
   },
   menuCoach: function() {
      return Markup
         .keyboard([
            [Markup.button('Добавить тренера', 'positive', {value: 'add_coach',})],
            [Markup.button('Изменить тренера', 'primary', {value: 'change_coach',})],
            [Markup.button('Удалить тренера', 'negative', {value: 'delete_coach',})]
         ])
         .oneTime()
   },
   confirmBtns: function() {
      return Markup
         .keyboard([
            Markup.button('Да', 'positive', {add_coach: 'yes'}),
            Markup.button('Нет', 'negative', {add_coach: 'no'})
         ])
         .oneTime()
   }
} 
