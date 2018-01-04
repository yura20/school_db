exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('column_for_teachers').del()
        .then(function () {
            // Inserts seed entries
            return knex('column_for_teachers').insert([
                {
                    id: 1,
                    name: 'id',
                    key: 'id'
                },
				{
					id: 2,
					name: 'Ім\'я',
					key: "name"
				},
				{
					id: 3,
					name: 'Прізвище',
					key: "sname"
				}
      ]);
        });
};
