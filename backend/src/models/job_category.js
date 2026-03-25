"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class JobCategory extends Model {
		static associate(models) {}
	}

	JobCategory.init(
		{
			jobId: { type: DataTypes.INTEGER, allowNull: false, field: "job_id" },
			categoryId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "category_id",
			},
		},
		{
			sequelize,
			modelName: "JobCategory",
			tableName: "job_categories",
			underscored: true,
			timestamps: false,
		},
	);

	return JobCategory;
};
