"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Adding 'interview' to ENUM is tricky in MySQL. 
		// The most reliable way is to use changeColumn with the new ENUM definition.
		await queryInterface.changeColumn("applications", "status", {
			type: Sequelize.ENUM("pending", "interview", "approved", "rejected"),
			allowNull: false,
			defaultValue: "pending",
		});
	},

	down: async (queryInterface, Sequelize) => {
		// Revert to original ENUM values
		await queryInterface.changeColumn("applications", "status", {
			type: Sequelize.ENUM("pending", "approved", "rejected"),
			allowNull: false,
			defaultValue: "pending",
		});
	},
};
