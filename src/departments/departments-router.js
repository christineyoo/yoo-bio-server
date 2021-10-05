const express = require('express')
const path = require('path')
const { serialize } = require('v8')
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
            if (!value) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        DepartmentsService.insertDepartment(knexInstance, newDepartment)
            .then(department => {
                return res.status(201).location(path.posix.join(req.originalUrl, `/${department.id}`)).json(serializeDepartment(department))
            })
            .catch(err => {
                console.log({ err })
                next()
            })
    })

    departmentsRouter
        .route('/:department_id')
        .all((req, res, next) => {
            const knexInstance = req.app.get('db')
            DepartmentsService.getById(knexInstance, req.params.department_id)
                .then(department => {
                    if (!department) {
                        return res.status(404).json({ error: { message: `Department doesn't exist`}})
                    }
                    res.department = department
                    next()
                })
                .catch(err => {
                    console.log({ err })
                    next()
                })
        })
        .get((req, res, next) => {
            res.json(serializeDepartment(res.department))
        })
        .delete((req, res, next) => {
            const knexInstance = req.app.get('db')
            DepartmentsService.deleteDepartment(knexInstance, req.params.department_id)
                .then(numRowsAffected => {
                    res.json({ message: `Successfully deleted` })
                    res.status(204).end()
                })
                .catch(err => {
                    console.log({ err })
                    next()
                })
        })
        .patch(jsonParser, (req, res, next) => {
            const knexInstance = req.app.get('db')
            const {name, description} = req.body
            const departmentToUpdate = {name, description};

            const numberOfValues = Object.values(departmentToUpdate).filter(Boolean).length //.filter(Boolean) creates an array of only truthy elements
            if (!numberOfValues) {
                return res.status(400).json({ error: { message: `Request body must contain name and description`}})
            }
            DepartmentsService.updateDepartment(knexInstance, req.params.department_id, departmentToUpdate)
                .then(numRowsAffected => {
                    res.json({ message: `Successfully updated`})
                    res.status(204).end()
                })
                .catch(err => {
                    console.log({ err })
                    next()
                })
        })

module.exports = departmentsRouter