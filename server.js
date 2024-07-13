require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3000

mongoose.connect(process.env.DATABASE_URI)

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('using postman')
})

app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
