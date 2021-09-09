const express = require('express')
const router = express.Router()
const { Padavan } = require('../mongoModels')
router.get('/', async (req, res) => {
  const allPadavans = await Padavan.findOne({ vk_id: '78943244' }).exec()
  res.render('index', {
    title: 'Шаблонизатор PUG',
    users: allPadavans,
  })
})
module.exports = router
