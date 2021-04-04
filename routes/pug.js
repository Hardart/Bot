const express = require('express')
const router = express.Router()
const { Padavan } = require('../models/padavans')
router.get('/', async (req, res) => {
<<<<<<< HEAD
	const allUsers = await Padavan.find()
	res.render('index', {
		title: 'Шаблонизатор PUG',
		users: allUsers
=======
	const allPadavans = await Padavan.find()
	res.render('index', {
		title: 'Шаблонизатор PUG',
		users: allPadavans
>>>>>>> 10dd844357b640fa20445e671111365a3f558754
	})
})
module.exports = router