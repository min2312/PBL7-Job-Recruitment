"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class JobLocation extends Model {
		static associate(models) {}
	}

	JobLocation.init(
		{
			jobId: { type: DataTypes.INTEGER, allowNull: false, field: "job_id" },
			locationId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "location_id",
			},
		},
		{
			sequelize,
			modelName: "JobLocation",
			tableName: "job_locations",
			underscored: true,
			timestamps: false,
		},
	);

	return JobLocation;
};
