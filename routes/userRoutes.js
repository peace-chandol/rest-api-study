const express = require('express')
const router = express.Router()
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)

router.route('/:id')
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router