const express = require('express')
const router = express.Router()
const { Padavan } = require('../models/padavans')
router.get('/', async (req, res) => {
	const allPadavans = await Padavan.find()
	res.render('index', {
		title: 'Шаблонизатор PUG',
		users: allPadavans
	})
})
module.exports = router