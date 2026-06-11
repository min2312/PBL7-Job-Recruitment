import cron from "node-cron";
import db from "../models";
import { createNotification } from "./notificationService";
import { Op } from "sequelize";
import moment from "moment-timezone";

const initCronJobs = () => {
	// Chạy lúc 6:00 AM hàng ngày theo múi giờ Việt Nam
	cron.schedule(
		"0 10 * * *",
		async () => {
			console.log("--- Running Daily Cron Job at 6:00 AM (VN Time) ---");
			await sendDailyInterviewReminders();
			await handleExpiredInterviews();
		},
		{
			scheduled: true,
			timezone: "Asia/Ho_Chi_Minh",
		},
	);

	console.log("Cron Jobs initialized with Asia/Ho_Chi_Minh timezone.");
};

/**
 * Nhắc lịch phỏng vấn diễn ra trong ngày hôm nay
 */
const sendDailyInterviewReminders = async () => {
	try {
		// Lấy khoảng thời gian "hôm nay" theo giờ Việt Nam
		const todayStart = moment().tz("Asia/Ho_Chi_Minh").startOf("day").toDate();
		const todayEnd = moment().tz("Asia/Ho_Chi_Minh").endOf("day").toDate();

		const interviews = await db.Interview.findAll({
			where: {
				scheduled_at: {
					[Op.between]: [todayStart, todayEnd],
				},
				status: "ACCEPTED",
				is_reminder_sent: false,
			},
			include: [
				{ model: db.User, as: "candidate" },
				{ model: db.User, as: "employer" },
				{ 
					model: db.Job, 
					as: "job",
					include: [{ model: db.Company, as: "Company" }]
				},
			],
		});

		for (const interview of interviews) {
			const company = interview.job?.Company;
			// Hiển thị giờ VN trong email
			const timeStr = moment(interview.scheduled_at)
				.tz("Asia/Ho_Chi_Minh")
				.format("HH:mm");

			// Nhắc ứng viên
			await createNotification({
				receiver_id: interview.candidate_id,
				type: "INTERVIEW_REMINDER",
				content: `Nhắc nhở: Bạn có lịch phỏng vấn vị trí ${interview.job?.title} lúc ${timeStr} hôm nay`,
				email_content: `
					<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
						<tr>
							${company?.logo ? `<td width="60" valign="top"><img src='${company.logo}' alt='Logo' width="50" height="50" border="0" style="border-radius: 8px; display: block;" /></td>` : ""}
							<td valign="top" style="padding-left: 15px;">
								<div style="font-size: 17px; font-weight: bold; color: #1e293b;">${company?.name}</div>
								<a href="${company?.website_url || "#"}" style="font-size: 13px; color: #2563eb; text-decoration: none;">Website công ty</a>
							</td>
						</tr>
					</table>
					<div style="font-size: 16px; color: #475569; line-height: 1.6;">
						<strong>Nhắc nhở:</strong> Bạn có lịch phỏng vấn hôm nay cho vị trí <strong style="color: #1e293b;">${interview.job?.title}</strong>.<br><br>
						<strong>Thời gian:</strong> ${timeStr}<br>
						<strong>Hình thức:</strong> ${interview.location?.includes("http") ? "Phỏng vấn trực tuyến" : "Phỏng vấn trực tiếp"}<br>
						${interview.location ? `<strong>Địa điểm/Link:</strong> ${interview.location}` : ""}
					</div>
				`,
				reference_id: interview.id.toString(),
				send_email: true,
			});

			// Nhắc nhà tuyển dụng
			await createNotification({
				receiver_id: interview.employer_id,
				type: "INTERVIEW_REMINDER",
				content: `Nhắc nhở: Bạn có lịch phỏng vấn ứng viên ${interview.candidate.name} hôm nay lúc ${timeStr}.`,
				reference_id: interview.id.toString(),
				send_email: true,
			});

			// Đánh dấu đã nhắc
			await interview.update({ is_reminder_sent: true });
		}

		console.log(`Sent ${interviews.length} daily reminders.`);
	} catch (error) {
		console.error("Error in sendDailyInterviewReminders:", error);
	}
};

/**
 * Tự động chuyển các lời mời PV quá hạn sang EXPIRED
 */
const handleExpiredInterviews = async () => {
	try {
		// Các buổi PV PENDING mà thời gian scheduled_at đã trôi qua
		const expiredInterviews = await db.Interview.findAll({
			where: {
				status: "PENDING",
				scheduled_at: {
					[Op.lt]: new Date(),
				},
			},
			include: [
				{ 
					model: db.Job, 
					as: "job",
					include: [{ model: db.Company, as: "Company" }]
				},
				{ model: db.User, as: "candidate" },
			],
		});

		for (const interview of expiredInterviews) {
			await interview.update({ status: "EXPIRED" });
			const company = interview.job?.Company;

			// Thông báo cho nhà tuyển dụng (Gửi cả Email)
			await createNotification({
				receiver_id: interview.employer_id,
				type: "SYSTEM",
				content: `Lời mời phỏng vấn vị trí ${interview.job?.title} cho ứng viên ${interview.candidate?.name} đã hết hạn`,
				email_content: `
					<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
						<tr>
							${company?.logo ? `<td width="60" valign="top"><img src='${company.logo}' alt='Logo' width="50" height="50" border="0" style="border-radius: 8px; display: block;" /></td>` : ""}
							<td valign="top" style="padding-left: 15px;">
								<div style="font-size: 17px; font-weight: bold; color: #1e293b;">${company?.name}</div>
							</td>
						</tr>
					</table>
					<div style="font-size: 16px; color: #475569; line-height: 1.6;">
						<strong>Thông báo:</strong> Lời mời phỏng vấn cho vị trí <strong style="color: #1e293b;">${interview.job?.title}</strong> dành cho ứng viên <strong>${interview.candidate?.name}</strong> đã tự động hết hạn do đã quá thời gian phản hồi.<br><br>
						Bạn có thể liên hệ lại với ứng viên hoặc tạo lịch mới nếu cần thiết.
					</div>
				`,
				reference_id: interview.id.toString(),
				send_email: true,
			});

			// Thông báo cho ứng viên (Gửi cả Email)
			await createNotification({
				receiver_id: interview.candidate_id,
				type: "SYSTEM",
				content: `Lời mời phỏng vấn vị trí ${interview.job?.title} từ ${company?.name || "Công ty"} đã hết hạn`,
				email_content: `
					<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
						<tr>
							${company?.logo ? `<td width="60" valign="top"><img src='${company.logo}' alt='Logo' width="50" height="50" border="0" style="border-radius: 8px; display: block;" /></td>` : ""}
							<td valign="top" style="padding-left: 15px;">
								<div style="font-size: 17px; font-weight: bold; color: #1e293b;">${company?.name}</div>
								<a href="${company?.website_url || "#"}" style="font-size: 13px; color: #2563eb; text-decoration: none;">Website công ty</a>
							</td>
						</tr>
					</table>
					<div style="font-size: 16px; color: #475569; line-height: 1.6;">
						<strong>Thông báo:</strong> Lời mời phỏng vấn cho vị trí <strong style="color: #1e293b;">${interview.job?.title}</strong> đã hết thời hạn phản hồi.<br><br>
						Rất tiếc bạn không thể thực hiện thao tác Chấp nhận hoặc Từ chối cho lời mời này nữa. Nếu vẫn quan tâm, vui lòng liên hệ trực tiếp với công ty.
					</div>
				`,
				reference_id: interview.id.toString(),
				send_email: true,
			});
		}

		console.log(`Marked ${expiredInterviews.length} interviews as EXPIRED.`);
	} catch (error) {
		console.error("Error in handleExpiredInterviews:", error);
	}
};

export { initCronJobs, sendDailyInterviewReminders, handleExpiredInterviews };
