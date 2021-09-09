const mongoose = require('mongoose')

const Padavan = mongoose.Schema({
  vk_id: Number,
  full_name: String,
  ren_login: String,
  ren_pass: String,
  w_code: String,
  coach_id: Number,
})

const Reg_data = mongoose.Schema({
  ren_login: String,
  ren_pass: String,
  w_code: String,
})

const Test = mongoose.Schema({
  title: String,
  prefix: String,
  number: Number,
  points: Number,
})

const Coach = mongoose.Schema({
  vk_id: Number,
  full_name: String,
  coach_id: Number,
})

module.exports = {
  Padavan: mongoose.model('Padavan', Padavan),
  RegData: mongoose.model('Reg_data', Reg_data),
  Test: mongoose.model('Test', Test),
  Coach: mongoose.model('Coach', Coach),
}
