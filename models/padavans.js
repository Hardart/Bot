const mongoose = require('mongoose')

const Pdvn = mongoose.Schema({
	vk_id: Number,
	full_name: String,
	ren_login: String,
	ren_pass: String,
	coach: Number,
	w_code: String,
	options: {
		hasQ: Boolean,
		changeCoach: Boolean
	}
})

module.exports = mongoose.model('Padavan', Pdvn)