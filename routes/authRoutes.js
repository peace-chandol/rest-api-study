const express = require('express')
const router = express.Router()
const { login, refresh, logout } = require('../controllers/authController')

router.post('/', login)
router.get('/refresh', refresh)
router.post('/logout', logout)

module.exports = router