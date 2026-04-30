"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Company extends Model {
		static associate(models) {
			Company.hasMany(models.Job, { foreignKey: "company_id" });
			Company.hasMany(models.User, { foreignKey: "company_id", as: "users" });
		}
	}

	Company.init(
		{
			name: { type: DataTypes.STRING, allowNull: false },
			logo: { type: DataTypes.STRING, allowNull: true },
			description: { type: DataTypes.TEXT, allowNull: true },
			website_url: { type: DataTypes.STRING, allowNull: true },
			company_address: { type: DataTypes.STRING, allowNull: true },
			company_scale: { type: DataTypes.STRING, allowNull: true },
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
