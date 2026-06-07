"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn("companies", "company_address", {
			type: Sequelize.TEXT,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn("companies", "company_address", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},
};
