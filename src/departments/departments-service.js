const DepartmentsService = {
    getAllDepartments(knex) {
        return knex('departments').select('*')
    },
    insertDepartment(knex, newDepartment) {
        return knex('departments').insert(newDepartment).returning('*').then(rows => {
            return rows[0]
        })
    },
    getById(knex, id) {
        return knex('departments').select('*').where({ id }).first()
    },
    deleteDepartment(knex, id) {
        return knex('reviews').where({ id }).delete()
    }
}

module.exports = DepartmentsService