
exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', function (table) {
		table.increments().primary();
		table.string('firstname');
		table.string('lastname');
		table.string('email').unique().notNullable();
		table.string('password').notNullable();
		table.boolean('confirmed').defaultTo(false);
		table.timestamps();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('users');
};
