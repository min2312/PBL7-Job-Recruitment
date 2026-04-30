"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("companies", "website_url", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("companies", "company_address", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("companies", "company_scale", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("companies", "company_scale");
		await queryInterface.removeColumn("companies", "company_address");
		await queryInterface.removeColumn("companies", "website_url");
	},
};
