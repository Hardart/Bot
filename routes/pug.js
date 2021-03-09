const express = require('express')
const router = express.Router()
const { RegData } = require('../models/padavans')
router.get('/', async (req, res) => {
	const allData = await RegData.find()
	res.render('index', {
		title: 'Шаблонизатор PUG',
		users: allData
	})
})
module.exports = router