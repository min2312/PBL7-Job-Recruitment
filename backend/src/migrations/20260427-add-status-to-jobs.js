"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("jobs", "status", {
			type: Sequelize.ENUM("open", "closed"),
			allowNull: false,
			defaultValue: "open",
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("jobs", "status");
	},
};
