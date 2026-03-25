"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Application extends Model {
		static associate(models) {
			Application.belongsTo(models.User, { foreignKey: "userId" });
			Application.belongsTo(models.Job, { foreignKey: "jobId" });
		}
	}

	Application.init(
		{
			userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
			jobId: { type: DataTypes.INTEGER, allowNull: false, field: "job_id" },
			cv_file: { type: DataTypes.STRING, allowNull: true },
			status: {
				type: DataTypes.ENUM("pending", "approved", "rejected"),
				allowNull: false,
				defaultValue: "pending",
			},
		},
		{
			sequelize,
			modelName: "Application",
			tableName: "applications",
			underscored: true,
			timestamps: true,
		},
	);

	return Application;
};
