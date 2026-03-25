"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("users", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			email: { type: Sequelize.STRING, allowNull: false, unique: true },
			password: { type: Sequelize.STRING, allowNull: false },
			role: {
				type: Sequelize.ENUM("CANDIDATE", "EMPLOYER"),
				allowNull: false,
				defaultValue: "CANDIDATE",
			},
			name: { type: Sequelize.STRING, allowNull: false },
			phone: { type: Sequelize.STRING, allowNull: true },
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

		await queryInterface.createTable("admins", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			email: { type: Sequelize.STRING, allowNull: false, unique: true },
			password: { type: Sequelize.STRING, allowNull: false },
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

		await queryInterface.createTable("companies", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: { type: Sequelize.STRING, allowNull: false },
			logo: { type: Sequelize.STRING, allowNull: true },
			description: { type: Sequelize.TEXT, allowNull: true },
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

		await queryInterface.createTable("jobs", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			company_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "companies",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			title: { type: Sequelize.STRING, allowNull: false },
			salary: { type: Sequelize.STRING, allowNull: true },
			level: { type: Sequelize.STRING, allowNull: true },
			experience: { type: Sequelize.STRING, allowNull: true },
			education: { type: Sequelize.STRING, allowNull: true },
			gender: { type: Sequelize.STRING, allowNull: true },
			age: { type: Sequelize.STRING, allowNull: true },
			employment_type: { type: Sequelize.STRING, allowNull: true },
			quantity: { type: Sequelize.INTEGER, allowNull: true },
			start_date: { type: Sequelize.DATE, allowNull: true },
			end_date: { type: Sequelize.DATE, allowNull: true },
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

		await queryInterface.createTable("categories", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: { type: Sequelize.STRING, allowNull: false },
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

		await queryInterface.createTable("job_categories", {
			job_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "jobs",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			category_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "categories",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
		});

		await queryInterface.createTable("locations", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: { type: Sequelize.STRING, allowNull: false },
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

		await queryInterface.createTable("job_locations", {
			job_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "jobs",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			location_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "locations",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
		});

		await queryInterface.createTable("applications", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
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
			},
			cv_file: { type: Sequelize.STRING, allowNull: true },
			status: {
				type: Sequelize.ENUM("pending", "approved", "rejected"),
				allowNull: false,
				defaultValue: "pending",
			},
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

		await queryInterface.createTable("saved_jobs", {
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
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
			},
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

		await queryInterface.addConstraint("job_categories", {
			type: "primary key",
			fields: ["job_id", "category_id"],
			name: "pk_job_categories",
		});

		await queryInterface.addConstraint("job_locations", {
			type: "primary key",
			fields: ["job_id", "location_id"],
			name: "pk_job_locations",
		});

		await queryInterface.addConstraint("saved_jobs", {
			type: "primary key",
			fields: ["user_id", "job_id"],
			name: "pk_saved_jobs",
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable("saved_jobs");
		await queryInterface.dropTable("applications");
		await queryInterface.dropTable("job_locations");
		await queryInterface.dropTable("locations");
		await queryInterface.dropTable("job_categories");
		await queryInterface.dropTable("categories");
		await queryInterface.dropTable("job_contents");
		await queryInterface.dropTable("jobs");
		await queryInterface.dropTable("companies");
		await queryInterface.dropTable("admins");
		await queryInterface.dropTable("users");
	},
};
