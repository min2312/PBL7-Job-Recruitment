const path = require("path");

require("dotenv").config({
	path: path.resolve(__dirname, "../../.env"),
});
const fs = require("fs");
module.exports = {
	development: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "mysql",
		port: process.env.DB_PORT,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: true,
			},
		},
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "mysql",
		port: process.env.DB_PORT,
	},
};
