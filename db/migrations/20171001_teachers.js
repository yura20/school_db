exports.up = function (knex, Promise) {
    return knex.schema.createTable('teachers', function (table) {
        table.increments();
        table.string('name').notNullable();
        table.string('sname').notNullable();
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('teachers');
};
