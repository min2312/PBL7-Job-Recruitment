"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("users", "company_id", {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
				model: "companies",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		});

		await queryInterface.addColumn("users", "profile_picture", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("users", "description", {
			type: Sequelize.TEXT,
			allowNull: true,
		});

		await queryInterface.addColumn("users", "cv_file", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("users", "cv_file");
		await queryInterface.removeColumn("users", "description");
		await queryInterface.removeColumn("users", "profile_picture");
		await queryInterface.removeColumn("users", "company_id");
	},
};
