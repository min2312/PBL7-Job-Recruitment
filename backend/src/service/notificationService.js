import db from "../models";
import { getIO } from "../socket/socket";
import { sendEmail } from "./mailerService";

/**
 * Create a new notification
 * @param {Object} data
 * @param {number} data.receiver_id
 * @param {number} data.sender_id
 * @param {string} data.type
 * @param {string} data.content
 * @param {string} [data.reference_id]
 * @param {boolean} [data.send_email=false]
 */
const createNotification = async (data) => {
	try {
		const {
			receiver_id,
			sender_id,
			type,
			content,
			email_content,
			reference_id,
			send_email = false,
		} = data;

		// 1. Save to DB
		const notification = await db.Notification.create({
			receiver_id,
			sender_id,
			type,
			content,
			reference_id,
		});

		// 2. Push via Socket
		try {
			const io = getIO();
			const sender = await db.User.findByPk(sender_id, {
				attributes: ["id", "name", "profile_picture"],
			});
			const notificationData = {
				...notification.get({ plain: true }),
				sender,
			};
			io.to(receiver_id.toString()).emit("newNotification", notificationData);
		} catch (ioError) {
			console.warn("Socket not initialized, skipping real-time push");
		}

		// 3. Send Email if requested
		if (send_email) {
			const receiver = await db.User.findByPk(receiver_id);
			if (receiver && receiver.email) {
				const subjectMap = {
					INTERVIEW_INVITATION: "Lời mời phỏng vấn từ MNP",
					INTERVIEW_RESPONSE: "Phản hồi lịch phỏng vấn",
					INTERVIEW_UPDATED: "Cập nhật lịch phỏng vấn",
					INTERVIEW_CANCELLED: "Thông báo hủy lịch phỏng vấn",
					NEW_MESSAGE: "Bạn có tin nhắn mới",
					NEW_APPLICANT: "Có ứng viên mới ứng tuyển",
					APPLICATION_STATUS_UPDATE: "Cập nhật trạng thái hồ sơ ứng tuyển",
					INTERVIEW_REMINDER: "Nhắc nhở lịch phỏng vấn sắp tới",
					SYSTEM: "Thông báo hệ thống",
				};

				const subject =
					subjectMap[type] ||
					`Thông báo mới từ MNP: ${type.replace(/_/g, " ")}`;

				// Ưu tiên dùng email_content nếu có, không thì dùng content
				let finalContent = email_content || content;

				// Fix lỗi URL phức tạp (TopCV) và link tương đối
				const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

				// 1. Tuyệt đối hóa link /uploads/
				finalContent = finalContent.replace(/src=['"]\/uploads/g, (match) => {
					return match.startsWith('src="')
						? `src="${backendUrl}/uploads`
						: `src='${backendUrl}/uploads`;
				});

				// 2. Làm sạch link TopCV lồng nhau (Gmail hay chặn loại này)
				// Ví dụ: https://cdn-new.topcv.vn/unsafe/80x/https://static.topcv.vn/... -> https://static.topcv.vn/...
				finalContent = finalContent.replace(
					/https:\/\/cdn-new\.topcv\.vn\/unsafe\/[^\/]*\/(https:\/\/[^'"]*)/g,
					"$1",
				);

				const htmlContent = `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<style>
							body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
							.container { max-width: 600px; margin: 20px auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden; }
							.header { background: #2563eb; color: white; padding: 30px; text-align: center; }
							.content { padding: 30px; background: #ffffff; }
							.message-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 25px; border-radius: 4px; margin: 20px 0; }
							.button { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; }
							.footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<h1 style="margin: 0;">MNP</h1>
								<p style="margin: 5px 0 0; opacity: 0.8;">Master New Potential</p>
							</div>
							<div class="content">
								<h2 style="color: #1e293b; margin-top: 0;">Xin chào ${receiver.name || "bạn"},</h2>
								<p>Chúng tôi có một thông báo quan trọng dành cho bạn từ hệ thống <strong>Master New Potential</strong>.</p>
								
								<div class="message-box">
									${finalContent}
								</div>

								<p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và thực hiện các bước theo sau.</p>
								
								<div style="text-align: center; margin-top: 30px;">
									<a href="${process.env.CLIENT_URL || "http://localhost:3000"}" class="button">Truy cập hệ thống</a>
								</div>
							</div>
							<div class="footer">
								<p>&copy; 2026 Master New Potential. Tất cả quyền được bảo lưu.</p>
							</div>
						</div>
					</body>
					</html>
				`;

				sendEmail({
					to: receiver.email,
					subject: subject,
					html: htmlContent,
				}).catch((err) =>
					console.error("Error sending email notification:", err),
				);
			}
		}

		return notification;
	} catch (error) {
		console.error("Error creating notification:", error);
		throw error;
	}
};

const getNotificationsByUserId = async (userId, limit = 20) => {
	return await db.Notification.findAll({
		where: { receiver_id: userId },
		order: [["createdAt", "DESC"]],
		limit,
		include: [
			{
				model: db.User,
				as: "sender",
				attributes: ["id", "name", "profile_picture"],
			},
		],
	});
};

const markAsRead = async (notificationId) => {
	return await db.Notification.update(
		{ is_read: true },
		{ where: { id: notificationId } },
	);
};

const markAllAsRead = async (userId) => {
	return await db.Notification.update(
		{ is_read: true },
		{ where: { receiver_id: userId, is_read: false } },
	);
};

export {
	createNotification,
	getNotificationsByUserId,
	markAsRead,
	markAllAsRead,
};
