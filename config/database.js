module.exports = {
	client: 'mysql',
	debug: false,
	connection: {
		host: process.env.DB_HOST || 'localhost',
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || 'ffc_node',
		charset: 'utf8'
	},
	migrations: {
		directory: 'database/migrations'
	},
	seeds: {
		directory: 'database/seeds'
	},
	plugins: {
		cascadeDelete: true,
		jsonColumns: true
	}
};
