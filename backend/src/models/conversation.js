"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Conversation extends Model {
		static associate(models) {
			Conversation.hasMany(models.Message, { foreignKey: "conversation_id", as: "messages" });
			Conversation.belongsTo(models.User, { foreignKey: "user_id_1", as: "user1" });
			Conversation.belongsTo(models.User, { foreignKey: "user_id_2", as: "user2" });
		}
	}
	Conversation.init(
		{
			user_id_1: DataTypes.INTEGER,
			user_id_2: DataTypes.INTEGER,
			last_message: DataTypes.TEXT,
			last_message_at: DataTypes.DATE,
			unread_count_1: DataTypes.INTEGER,
			unread_count_2: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "Conversation",
			underscored: true,
		},
	);
	return Conversation;
};
