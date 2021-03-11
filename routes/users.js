const express = require('express')
const router = express.Router()
const { Padavan, RegData } = require('../models/padavans')
router.use(express.json())
router.get('/', (req, res) => {
	res.send("")
})

router.post('/', async (req, res) => {
	console.log(req.body)
	const allUsers = await Padavan.find()
	res.json(allUsers)
})

// const formidableMiddleware = require('express-formidable')
// router.use(formidableMiddleware())
module.exports = router