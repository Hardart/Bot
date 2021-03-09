const express = require('express')
const formidableMiddleware = require('express-formidable');
const router = express.Router()
const { Padavan, RegData } = require('../models/padavans')
router.use(formidableMiddleware())
router.get('/', async (req, res) => {
	const allUsers = await Padavan.find()
	let users = ""
	for (user of allUsers) {
		users += user.full_name + "<br>"
	}
	res.send(users)
})

router.post('/', (req, res) => {
	console.log(req.fields)
})

module.exports = router