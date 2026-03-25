"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class SavedJob extends Model {
		static associate(models) {
			SavedJob.belongsTo(models.User, { foreignKey: "userId" });
			SavedJob.belongsTo(models.Job, { foreignKey: "jobId" });
		}
	}

	SavedJob.init(
		{
			userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
			jobId: { type: DataTypes.INTEGER, allowNull: false, field: "job_id" },
		},
		{
			sequelize,
			modelName: "SavedJob",
			tableName: "saved_jobs",
			underscored: true,
			timestamps: true,
		},
	);

	return SavedJob;
};
