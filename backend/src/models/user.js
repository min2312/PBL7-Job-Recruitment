"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasMany(models.Application, { foreignKey: "userId" });
			User.belongsToMany(models.Job, {
				through: models.SavedJob,
				foreignKey: "userId",
				otherKey: "jobId",
				as: "saved_jobs",
			});
			User.belongsTo(models.Company, { foreignKey: "company_id", as: "company" });
		}
	}

	User.init(
		{
			email: { type: DataTypes.STRING, unique: true, allowNull: false },
			password: { type: DataTypes.STRING, allowNull: false },
			companyId: { type: DataTypes.INTEGER, allowNull: true },
			profilePicture: { type: DataTypes.STRING, allowNull: true },
			description: { type: DataTypes.TEXT, allowNull: true },
			cv_file: { type: DataTypes.STRING, allowNull: true },
			role: {
				type: DataTypes.ENUM("CANDIDATE", "EMPLOYER"),
				allowNull: false,
				defaultValue: "CANDIDATE",
			},
			name: { type: DataTypes.STRING, allowNull: false },
			phone: { type: DataTypes.STRING, allowNull: true },
		},
		{
			sequelize,
			modelName: "User",
			tableName: "users",
			underscored: true,
			timestamps: true,
		},
	);

	return User;
};
