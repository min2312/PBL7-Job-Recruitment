"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Message extends Model {
		static associate(models) {
			Message.belongsTo(models.User, { foreignKey: "sender_id", as: "sender" });
			Message.belongsTo(models.User, { foreignKey: "receiver_id", as: "receiver" });
			Message.belongsTo(models.Conversation, { foreignKey: "conversation_id", as: "conversation" });
		}
	}
	Message.init(
		{
			sender_id: DataTypes.INTEGER,
			receiver_id: DataTypes.INTEGER,
			conversation_id: DataTypes.INTEGER,
			content: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Message",
			underscored: true,
		},
	);
	return Message;
};
