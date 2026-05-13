"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("interviews", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			candidate_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			employer_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			job_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "jobs",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			scheduled_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			location: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM(
					"PENDING",
					"ACCEPTED",
					"DECLINED",
					"RESCHEDULE_REQUESTED",
					"COMPLETED",
					"CANCELLED",
					"EXPIRED"
				),
				allowNull: false,
				defaultValue: "PENDING",
			},
			candidate_note: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			is_reminder_sent: {
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
		await queryInterface.dropTable("interviews");
	},
};
