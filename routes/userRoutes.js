const express = require('express')
const router = express.Router()
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')

router.route('/')
    .get(verifyJWT, getAllUsers)
    .post(createNewUser)

router.use(verifyJWT)

router.route('/:id')
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router