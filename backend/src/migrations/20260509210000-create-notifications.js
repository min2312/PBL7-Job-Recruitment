"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("notifications", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			receiver_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			sender_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			type: {
				type: Sequelize.ENUM(
					"INTERVIEW_INVITATION",
					"INTERVIEW_REMINDER",
					"INTERVIEW_RESPONSE",
					"APPLICATION_STATUS",
					"NEW_APPLICANT",
					"NEW_MESSAGE",
					"SYSTEM"
				),
				allowNull: false,
			},
			reference_id: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			is_read: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("notifications");
	},
};
