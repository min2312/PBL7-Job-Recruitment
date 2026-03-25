"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Location extends Model {
		static associate(models) {
			Location.belongsToMany(models.Job, {
				through: models.JobLocation,
				foreignKey: "location_id",
				otherKey: "job_id",
				as: "jobs",
			});
		}
	}

	Location.init(
		{
			name: { type: DataTypes.STRING, allowNull: false },
		},
		{
			sequelize,
			modelName: "Location",
			tableName: "locations",
			underscored: true,
			timestamps: true,
		},
	);

	return Location;
};
