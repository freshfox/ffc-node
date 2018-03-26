
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('invoices', function (table) {
			table.increments().primary();
		}),

		knex.schema.createTable('invoice_lines', function (table) {
			table.increments().primary();
			table.text('description');
			table.integer('order');
			table.integer('invoice_id').unsigned().references('id').inTable('invoices');
			table.timestamps();
		}),

		knex.schema.createTable('payments', function (table) {
			table.increments().primary();
			table.integer('amount');
			table.timestamps();
		}),

		knex.schema.createTable('invoices_payments', function (table) {
			table.integer('invoice_id').unsigned().references('id').inTable('invoices');
			table.integer('payment_id').unsigned().references('id').inTable('payments');
			table.unique(['invoice_id', 'payment_id']);
		})

	]);
};

exports.down = function(knex, Promise) {

};
