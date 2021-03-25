const express = require('express')
const formidableMiddleware = require('express-formidable');
const router = express.Router()
const { Padavan, RegData } = require('../models/padavans')
router.use(formidableMiddleware())

router.post('/', (req, res) => {
	console.log(req.fields)
})

module.exports = router