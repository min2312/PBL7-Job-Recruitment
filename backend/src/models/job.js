"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Job extends Model {
		static associate(models) {
			Job.belongsTo(models.Company, { foreignKey: "companyId" });
			Job.hasMany(models.Application, { foreignKey: "jobId" });
			Job.belongsToMany(models.Category, {
				through: models.JobCategory,
				foreignKey: "jobId",
				otherKey: "categoryId",
				as: "categories",
			});
			Job.belongsToMany(models.Location, {
				through: models.JobLocation,
				foreignKey: "jobId",
				otherKey: "locationId",
				as: "locations",
			});
			Job.belongsToMany(models.User, {
				through: models.SavedJob,
				foreignKey: "jobId",
				otherKey: "userId",
				as: "saved_by_users",
			});
		}
	}

	Job.init(
		{
			companyId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "company_id",
			},
			title: { type: DataTypes.STRING, allowNull: false },
			salary: { type: DataTypes.STRING, allowNull: true },
			level: { type: DataTypes.STRING, allowNull: true },
			experience: { type: DataTypes.STRING, allowNull: true },
			education: { type: DataTypes.STRING, allowNull: true },
			gender: { type: DataTypes.STRING, allowNull: true },
			age: { type: DataTypes.STRING, allowNull: true },
			jobUrl: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "job_url",
			},
			employmentType: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "employment_type",
			},
			quantity: { type: DataTypes.INTEGER, allowNull: true },
			startDate: { type: DataTypes.DATE, allowNull: true, field: "start_date" },
			endDate: { type: DataTypes.DATE, allowNull: true, field: "end_date" },
			description: { type: DataTypes.TEXT, allowNull: true },
			requirement: { type: DataTypes.TEXT, allowNull: true },
			benefit: { type: DataTypes.TEXT, allowNull: true },
			workLocation: {
				type: DataTypes.TEXT,
				allowNull: true,
				field: "work_location",
			},
			workTime: {
				type: DataTypes.TEXT,
				allowNull: true,
				field: "work_time",
			},
			status: {
				type: DataTypes.ENUM("open", "closed"),
				allowNull: false,
				defaultValue: "open",
			},
		},
		{
			sequelize,
			modelName: "Job",
			tableName: "jobs",
			underscored: true,
			timestamps: true,
		},
	);

	return Job;
};
