exports.up = function (knex, Promise) {
    return knex.schema.createTable('column_for_teachers', function (table) {
        table.increments();
        table.string('name').notNullable();
        table.string('key').notNullable();
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('column_for_teachers');
};
