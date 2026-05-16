"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Interview extends Model {
		static associate(models) {
			Interview.belongsTo(models.User, {
				foreignKey: "candidate_id",
				as: "candidate",
			});
			Interview.belongsTo(models.User, {
				foreignKey: "employer_id",
				as: "employer",
			});
			Interview.belongsTo(models.Job, {
				foreignKey: "job_id",
				as: "job",
			});
		}
	}
	Interview.init(
		{
			candidate_id: { type: DataTypes.INTEGER, allowNull: false },
			employer_id: { type: DataTypes.INTEGER, allowNull: false },
			job_id: { type: DataTypes.INTEGER, allowNull: false },
			scheduled_at: { type: DataTypes.DATE, allowNull: false },
			location: { type: DataTypes.STRING, allowNull: true },
			type: { type: DataTypes.STRING, allowNull: false, defaultValue: "online_inapp" },
			status: {
				type: DataTypes.ENUM(
					"PENDING",
					"ACCEPTED",
					"DECLINED",
					"RESCHEDULE_REQUESTED",
					"COMPLETED",
					"CANCELLED",
					"EXPIRED"
				),
				allowNull: false,
				defaultValue: "PENDING",
			},
			candidate_note: { type: DataTypes.TEXT, allowNull: true },
			is_reminder_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
		},
		{
			sequelize,
			modelName: "Interview",
			tableName: "interviews",
			underscored: true,
			timestamps: true,
		},
	);
	return Interview;
};
