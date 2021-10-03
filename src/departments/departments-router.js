const express = require('express')
const path = require('path')
const xss = require('xss')
const DepartmentsService = require('./departments-service')

const departmentsRouter = express.Router()
const jsonParser = express.json() //used for POST request

const serializeDepartment = department => (
    {
        id: department.id,
        name: xss(department.name),
        description: xss(department.description)
    }
)

departmentsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        DepartmentsService.getAllDepartments(knexInstance)
            .then(departments => {
                res.json(departments.map(serializeDepartment))
            })
            .catch(err => {
                console.log({ err })
                next()
            })
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name, description } = req.body
        const newDepartment = { name, description }
        for (const [key, value] of Object.entries(newDepartment)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        DepartmentsService.insertDepartment(knexInstance, newDepartment)
            .then(department => {
                return res.status(201).json(serializeDepartment(department))
            })
            .catch(err => {
                console.log({ err })
                next()
            })
    })

module.exports = departmentsRouter