"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Category extends Model {
		static associate(models) {
			Category.belongsToMany(models.Job, {
				through: models.JobCategory,
				foreignKey: "category_id",
				otherKey: "job_id",
				as: "jobs",
			});
		}
	}

	Category.init(
		{
			name: { type: DataTypes.STRING, allowNull: false },
		},
		{
			sequelize,
			modelName: "Category",
			tableName: "categories",
			underscored: true,
			timestamps: true,
		},
	);

	return Category;
};
