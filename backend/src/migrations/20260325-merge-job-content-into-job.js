"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const jobCols = await queryInterface.describeTable("jobs");
		if (!jobCols.description) {
			await queryInterface.addColumn("jobs", "description", {
				type: Sequelize.TEXT,
				allowNull: true,
			});
		}
		if (!jobCols.requirement) {
			await queryInterface.addColumn("jobs", "requirement", {
				type: Sequelize.TEXT,
				allowNull: true,
			});
		}
		if (!jobCols.benefit) {
			await queryInterface.addColumn("jobs", "benefit", {
				type: Sequelize.TEXT,
				allowNull: true,
			});
		}
		if (!jobCols.work_location) {
			await queryInterface.addColumn("jobs", "work_location", {
				type: Sequelize.TEXT,
				allowNull: true,
			});
		}
		if (!jobCols.work_time) {
			await queryInterface.addColumn("jobs", "work_time", {
				type: Sequelize.TEXT,
				allowNull: true,
			});
		}

		const allTables = await queryInterface.showAllTables();
		if (allTables.includes("job_contents")) {
			await queryInterface.sequelize.query(`
				UPDATE jobs
				JOIN job_contents jc ON jc.job_id = jobs.id
				SET
					jobs.description = jc.description,
					jobs.requirement = jc.requirement,
					jobs.benefit = jc.benefit,
					jobs.work_location = jc.work_location,
					jobs.work_time = jc.work_time;
			`);

			await queryInterface.dropTable("job_contents");
		}
	},

	down: async (queryInterface, Sequelize) => {
		const allTables = await queryInterface.showAllTables();
		if (!allTables.includes("job_contents")) {
			await queryInterface.createTable("job_contents", {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				job_id: {
					type: Sequelize.INTEGER,
					allowNull: false,
					references: {
						model: "jobs",
						key: "id",
					},
					onDelete: "CASCADE",
					onUpdate: "CASCADE",
					unique: true,
				},
				description: { type: Sequelize.TEXT, allowNull: true },
				requirement: { type: Sequelize.TEXT, allowNull: true },
				benefit: { type: Sequelize.TEXT, allowNull: true },
				work_location: { type: Sequelize.TEXT, allowNull: true },
				work_time: { type: Sequelize.TEXT, allowNull: true },
				created_at: {
					type: Sequelize.DATE,
					allowNull: false,
					defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
				},
				updated_at: {
					type: Sequelize.DATE,
					allowNull: false,
					defaultValue: Sequelize.literal(
						"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
					),
				},
			});

			await queryInterface.sequelize.query(`
				INSERT INTO job_contents (job_id, description, requirement, benefit, work_location, work_time, created_at, updated_at)
				SELECT id, description, requirement, benefit, work_location, work_time, NOW(), NOW()
				FROM jobs
				WHERE description IS NOT NULL OR requirement IS NOT NULL OR benefit IS NOT NULL OR work_location IS NOT NULL OR work_time IS NOT NULL;
			`);
		}

		await queryInterface.removeColumn("jobs", "description");
		await queryInterface.removeColumn("jobs", "requirement");
		await queryInterface.removeColumn("jobs", "benefit");
		await queryInterface.removeColumn("jobs", "work_location");
		await queryInterface.removeColumn("jobs", "work_time");
	},
};
