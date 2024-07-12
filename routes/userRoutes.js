const express = require('express')
const router = express.Router()
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/userController')

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)

router.route('/:id')
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router