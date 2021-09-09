const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { Padavan } = require('../mongoModels')
const { sendRequest } = require('../functions')
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.get('/', async (req, res) => {
  // let url = 'http://46.183.163.108/'

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
  res.end('I got it')
})

// const formidableMiddleware = require('express-formidable')
// router.use(formidableMiddleware())
module.exports = router
