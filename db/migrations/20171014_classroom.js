exports.up = function (knex, Promise) {
    return knex.schema.createTable('classroom', function (table) {
        table.increments();
        table.string('name').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('teachers_id').notNullable();
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('classroom');
};
