const express = require('express')
const router = express.Router()
const { Padavan, RegData } = require('../models/padavans')
<<<<<<< HEAD
router.use(formidableMiddleware())
=======
router.use(express.json())
router.get('/', (req, res) => {
	res.send("")
})
>>>>>>> 10dd844357b640fa20445e671111365a3f558754

router.post('/', async (req, res) => {
	console.log(req.body)
	const allUsers = await Padavan.find()
	res.json(allUsers)
})

// const formidableMiddleware = require('express-formidable')
// router.use(formidableMiddleware())
module.exports = router