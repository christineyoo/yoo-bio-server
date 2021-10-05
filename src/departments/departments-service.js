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
        return knex('departments').where({ id }).delete()
    },
    updateDepartment(knex, id, newDepartmentFields) {
        return knex('departments').where({ id }).update(newDepartmentFields)
    }
}

module.exports = DepartmentsService