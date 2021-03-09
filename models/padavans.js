const mongoose = require('mongoose')

const Pdvn = mongoose.Schema({
	vk_id: Number,
	full_name: String,
	ren_login: String,
	ren_pass: String,
	w_code: String,
	coach_id: Number,
	options: {
		hasQ: Boolean,
		changeCoach: Boolean
	}
})

const Reg_data = mongoose.Schema({
	ren_login: String,
	ren_pass: String,
	w_code: String
})

module.exports = {
	Padavan: mongoose.model('Padavan', Pdvn),
	RegData: mongoose.model('Reg_data', Reg_data)
}