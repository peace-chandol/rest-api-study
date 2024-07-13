const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// generate accessToken(json) and refreshToken(cookies)
const login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    try {
        const foundUser = await User.findOne({ username })
        if (!foundUser) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const match = await bcrypt.compare(password, foundUser.password)
        if (!match) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const accessToken = jwt.sign(
            { "username": foundUser.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1m' } // normal expiresIn: 15m
        )

        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true, // in localhost no need this
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000 // make same as refreshToken expires
        })

        res.json({ accessToken })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

// if have refreshToken it generate accessToken
const refresh = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        console.log(cookies)
        return res.status(400).json({ message: 'Unauthorized' })
    }

    const refreshToken = cookies.jwt

    try {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Forbidden' })

                const foundUser = await User.findOne({ username: decoded.username })
                if (!foundUser) {
                    return res.status(401).json({ message: 'Unauthorized' })
                }

                const accessToken = jwt.sign(
                    { "username": foundUser.username },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '1m' } // normal expiresIn: 15m
                )

                res.json({ accessToken })
            }
        )
            
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

// clear refreshToken in cookies
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        return res.sendStatus(204)
    }
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}