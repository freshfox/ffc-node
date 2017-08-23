
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('users', function (table) {
			table.increments().primary();
			table.string('firstname');
			table.string('lastname');
			table.string('email').unique().notNullable();
			table.string('password').notNullable();
			table.boolean('confirmed').defaultTo(false);
			table.json('settings');
			table.timestamps();
		}),
		knex.schema.createTable('accounts', function (table) {
			table.increments().primary();
			table.string('test');
			table.json('settings');
		}),
		knex.schema.createTable('posts', function (table) {
			table.increments().primary();
			table.string('title');
			table.text('content');
			table.integer('user_id').unsigned().references('id').inTable('users');
			table.timestamps();
		})
	])

};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('users');
};
