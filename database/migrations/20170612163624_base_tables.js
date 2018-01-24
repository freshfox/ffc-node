
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
		}),
		knex.schema.createTable('logs', function (table) {
			table.integer('id').unsigned();
			table.string('text');
			table.timestamps();
		}),
		knex.schema.createTable('model_a', function (table) {
			table.increments().primary();
			table.string('text');
			table.timestamps();
		}),
		knex.schema.createTable('model_b', function (table) {
			table.increments().primary();
			table.string('text');
			table.timestamps();
		}),
		knex.schema.createTable('model_a_model_b', function (table) {
			table.integer('model_a_id').unsigned().references('id').inTable('model_a');
			table.integer('model_b_id').unsigned().references('id').inTable('model_b');
			table.unique(['model_a_id', 'model_b_id']);
		}),
	])

};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('users');
};
