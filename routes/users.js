const express = require('express')
const { sha256 } = require('js-sha256')
const router = express.Router()
const fetch = require('node-fetch')
const { Padavan, RegData } = require('../models/padavans')
const { sendRequest } = require('../functions')
router.use(express.json())
router.get('/', async (req, res) => {
	const allUsers = await Padavan.find()
	let users = ""
	for (user of allUsers) {
		users += user.full_name + "<br>"
	}

	// sendRequest('GET', url).then(data => console.log(data))
	res.redirect(url)
})

router.post('/', async (req, res) => {
	console.log(req.body)
	const allUsers = await Padavan.find()
	res.json(allUsers)
})

// const formidableMiddleware = require('express-formidable')
// router.use(formidableMiddleware())
module.exports = router