"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Notification extends Model {
		static associate(models) {
			Notification.belongsTo(models.User, {
				foreignKey: "receiver_id",
				as: "receiver",
			});
			Notification.belongsTo(models.User, {
				foreignKey: "sender_id",
				as: "sender",
			});
		}
	}
	Notification.init(
		{
			receiver_id: { type: DataTypes.INTEGER, allowNull: false },
			sender_id: { type: DataTypes.INTEGER, allowNull: true },
			type: {
				type: DataTypes.ENUM(
					"INTERVIEW_INVITATION",
					"INTERVIEW_REMINDER",
					"INTERVIEW_RESPONSE",
					"INTERVIEW_UPDATED",
					"INTERVIEW_CANCELLED",
					"APPLICATION_STATUS",
					"APPLICATION_STATUS_UPDATE",
					"NEW_APPLICANT",
					"NEW_MESSAGE",
					"SYSTEM"
				),
				allowNull: false,
			},
			reference_id: { type: DataTypes.STRING, allowNull: true },
			content: { type: DataTypes.TEXT, allowNull: false },
			is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
		},
		{
			sequelize,
			modelName: "Notification",
			tableName: "notifications",
			underscored: true,
			timestamps: true,
		},
	);
	return Notification;
};
