const Scene = require('node-vk-bot-api/lib/scene')
const Markup = require('node-vk-bot-api/lib/markup')
const { Coach, Padavan, RegData } = require('../mongoModels')
const kbd = require('../keyboards')
const query = require('../query')
const api = require('node-vk-bot-api/lib/api')
const { newKeybord, fromBegin } = require('../functions')

const question = new Scene(
   'send_to_coach',
   async (ctx) => {
      console.log('Yes')
   },
   async (ctx) => {}
)

module.exports = {
   sendToCaoch: question,
}
