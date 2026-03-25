"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Company extends Model {
		static associate(models) {
			Company.hasMany(models.Job, { foreignKey: "company_id" });
		}
	}

	Company.init(
		{
			name: { type: DataTypes.STRING, allowNull: false },
			logo: { type: DataTypes.STRING, allowNull: true },
			description: { type: DataTypes.TEXT, allowNull: true },
		},
		{
			sequelize,
			modelName: "Company",
			tableName: "companies",
			underscored: true,
			timestamps: true,
		},
	);

	return Company;
};
