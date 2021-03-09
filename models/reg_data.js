const mongoose = require('mongoose')

const Reg_data = mongoose.Schema({
	ren_login: String,
	ren_pass: String,
	w_code: String
})

module.exports = mongoose.model('Reg_data', Reg_data)