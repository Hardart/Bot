const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { Padavan, RegData } = require('../models/padavans')
const { sendRequest } = require('../functions')
router.use(express.json())

router.get('/', async (req, res) => {
	let url = 'http://89.108.88.140/post'
	const allUsers = await Padavan.find()
	let users = ''
	for (user of allUsers) {
		users += user.full_name + '<br>'
	}
	let body = {
		name: 'hard',
	}
	sendRequest('post', url, body).then((res) => {
		console.log(res)
	})
	// res.redirect(url)
})

router.post('/', async (req, res) => {
	console.log(req.body)
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Content-Type', 'text/html; charset=UTF-8')
	// const allUsers = await Padavan.find()
	res.end('ok')
})

// const formidableMiddleware = require('express-formidable')
// router.use(formidableMiddleware())
module.exports = router
