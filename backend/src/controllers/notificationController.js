import * as notificationService from "../service/notificationService";
import db from "../models";

const getNotifications = async (req, res) => {
	try {
		const userId = req.user.id;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		const { count, rows } = await db.Notification.findAndCountAll({
			where: { receiver_id: userId },
			order: [["createdAt", "DESC"]],
			limit,
			offset,
		});

		return res.status(200).json({
			errCode: 0,
			data: rows,
			pagination: {
				total: count,
				page,
				limit,
				totalPages: Math.ceil(count / limit),
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const markAsRead = async (req, res) => {
	try {
		const { id } = req.params;
		await notificationService.markAsRead(id);
		return res.status(200).json({
			errCode: 0,
			message: "Marked as read",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const markAllAsRead = async (req, res) => {
	try {
		const userId = req.user.id;
		await notificationService.markAllAsRead(userId);
		return res.status(200).json({
			errCode: 0,
			message: "All marked as read",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

export { getNotifications, markAsRead, markAllAsRead };
