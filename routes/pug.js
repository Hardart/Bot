const express = require('express')
const router = express.Router()
const { Padavan } = require('../models/padavans')
router.get('/', async (req, res) => {
	const allUsers = await Padavan.find()
	res.render('index', {
		title: 'Шаблонизатор PUG',
		users: allUsers
	})
})
module.exports = router