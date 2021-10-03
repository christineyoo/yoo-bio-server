require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const departmentsRouter = require('./departments/departments-router')

const app = express()

const morganOption = (process.env.NODE_ENV === 'production') ? 'tiny' : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/departments', departmentsRouter)

app.get('/', (req, res) => {
    res.send('Hello big world!')
})

module.exports = app