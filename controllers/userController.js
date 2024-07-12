const User = require('../models/User')
const bcrypt = require('bcrypt')

const getAllUsers = async (req, res) => {
    try {
        // .lean()  better performance for large datasets but no access method like .save() and .update()
        const users = await User.find().select('-password').lean()
        if (!users?.length) {
            return res.status(400).json({ message: 'No users found' })
        }

        res.json(users)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }

}

const createNewUser = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    
    try {
        // .collation({ locale: 'en', strength: 2 }) this means usernames like Peace, peace, peACe considered duplicates
        const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean()
        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate username' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const userObject = { username, 'password': hashedPassword }
        const user = await User.create(userObject)

        if (user) {
            res.status(201).json({ message: `New user ${username} created` })
        } else {
            res.status(400).json({ message: 'Invalid user data recieved' })
        }

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { username, password } = req.body

    if (!id || !username) {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    try {
        const user = await User.findById(id)

        if (!user) {
            return res.status(400).json({ message: 'User not found' })
        }

        const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean()
        if (duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate username' })
        }

        user.username = username

        if (password) {
            user.password = await bcrypt.hash(password, 10)
        }

        const updatedUser = await user.save()

        res.json({ message: `${updatedUser.username} updated` })


    } catch (err) {
        console.error
        res.status(500).json({ message: 'Server Error' })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'User ID required' })
    }

    try {
        const user = await User.findById(id)

        if (!user) {
            return res.status(400).json({ message: 'No users found' })
        }

        await user.deleteOne().exec()

        res.status(202).json({ message: `Username ${user.username} deleted` })

    } catch (err) {
        console.error
        res.status(500).json({ message: 'Server Error' })
    }
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}