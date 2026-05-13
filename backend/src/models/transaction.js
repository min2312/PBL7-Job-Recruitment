"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Transaction extends Model {
		static associate(models) {
			Transaction.belongsTo(models.User, { foreignKey: "user_id" });
			Transaction.belongsTo(models.Job, { foreignKey: "job_id" });
		}
	}

	Transaction.init(
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				field: "user_id",
			},
			jobId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				field: "job_id",
			},
			amount: { type: DataTypes.INTEGER, allowNull: false },
			orderCode: {
				type: DataTypes.BIGINT,
				allowNull: false,
				unique: true,
				field: "order_code",
			},
			status: {
				type: DataTypes.ENUM("PENDING", "SUCCESS", "CANCELLED"),
				defaultValue: "PENDING",
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "Transaction",
			tableName: "transactions",
			underscored: true,
			timestamps: true,
		},
	);

	return Transaction;
};
