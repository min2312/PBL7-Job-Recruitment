import db from "../models";
import { createNotification } from "./notificationService";
import moment from "moment-timezone";

/**
 * Nhà tuyển dụng tạo lịch phỏng vấn
 */
const createInterview = async (data) => {
	try {
		const { candidate_id, employer_id, job_id, scheduled_at, location } = data;

		// Validation: Chặn thời gian quá khứ
		if (moment(scheduled_at).isBefore(moment())) {
			throw new Error("Thời gian phỏng vấn không được ở trong quá khứ.");
		}

		const interview = await db.Interview.create({
			candidate_id,
			employer_id,
			job_id,
			scheduled_at,
			location,
			status: "PENDING",
		});

		// Lấy thông tin công việc và công ty
		const job = await db.Job.findByPk(job_id, {
			include: [{ model: db.Company, as: "Company" }],
		});
		const company = job?.Company;

		const timeStr = moment(scheduled_at).tz("Asia/Ho_Chi_Minh").format("HH:mm");
		const dateStr = moment(scheduled_at)
			.tz("Asia/Ho_Chi_Minh")
			.format("DD/MM/YYYY");

		// Gửi thông báo cho ứng viên
		await createNotification({
			receiver_id: candidate_id,
			sender_id: employer_id,
			type: "INTERVIEW_INVITATION",
			content: `Lời mời phỏng vấn vị trí ${job?.title} từ ${company?.name || "Công ty"}`,
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
					Bạn nhận được lời mời phỏng vấn cho vị trí: <strong style="color: #1e293b;">${job?.title}</strong><br>
					<strong>Thời gian:</strong> ${timeStr} ngày ${dateStr}<br>
					${location ? `<strong>Địa điểm/Link:</strong> ${location}` : ""}
				</div>
			`,
			reference_id: interview.id.toString(),
			send_email: true,
		});

		return interview;
	} catch (error) {
		console.error("Error in createInterview:", error);
		throw error;
	}
};

/**
 * Cập nhật trạng thái phỏng vấn (Dành cho ứng viên phản hồi)
 */
const updateInterviewStatus = async (id, status, note, userId) => {
	try {
		const interview = await db.Interview.findByPk(id, {
			include: [
				{ model: db.User, as: "candidate" },
				{ model: db.Job, as: "job" },
			],
		});

		if (!interview) throw new Error("Interview not found");

		// Chặn nếu lịch đã hết hạn hoặc đã bị hủy
		if (interview.status === "EXPIRED") {
			throw new Error(
				"Lời mời phỏng vấn này đã hết hạn, bạn không thể phản hồi nữa.",
			);
		}
		if (interview.status === "CANCELLED") {
			throw new Error("Buổi phỏng vấn này đã bị hủy bỏ.");
		}

		await interview.update({ status, candidate_note: note });

		// Thông báo cho nhà tuyển dụng về phản hồi của ứng viên
		const statusMap = {
			ACCEPTED: "đã CHẤP NHẬN",
			DECLINED: "đã TỪ CHỐI",
			RESCHEDULE_REQUESTED: "yêu cầu ĐỔI LỊCH",
		};

		const statusMsg = statusMap[status] || "đã phản hồi";
		const timeStr = moment(interview.scheduled_at)
			.tz("Asia/Ho_Chi_Minh")
			.format("HH:mm DD/MM");

		await createNotification({
			receiver_id: interview.employer_id,
			sender_id: userId,
			type: "INTERVIEW_RESPONSE",
			content: `Ứng viên ${interview.candidate?.name} ${statusMsg} lời mời phỏng vấn vị trí ${interview.job?.title}`,
			email_content: `
				<div style="font-size: 16px; color: #475569; line-height: 1.6;">
					Ứng viên <strong style="color: #1e293b;">${interview.candidate?.name}</strong> ${statusMsg} lời mời phỏng vấn.<br><br>
					<strong>Vị trí:</strong> ${interview.job?.title}<br>
					<strong>Thời gian:</strong> ${timeStr}<br>
					${note ? `<strong>Ghi chú từ ứng viên:</strong> ${note}` : ""}
				</div>
			`,
			reference_id: interview.id.toString(),
			send_email: true,
		});

		return interview;
	} catch (error) {
		console.error("Error in updateInterviewStatus:", error);
		throw error;
	}
};

const getInterviewsByUser = async (userId, role, options = {}) => {
	const { page = 1, limit = 10, status = "ALL", date } = options;
	const offset = (page - 1) * limit;

	const whereClause =
		role === "EMPLOYER" ? { employer_id: userId } : { candidate_id: userId };
	if (status !== "ALL") {
		whereClause.status = status;
	}

	if (date) {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		whereClause.scheduled_at = {
			[db.Sequelize.Op.between]: [startOfDay, endOfDay],
		};
	}

	const { count, rows } = await db.Interview.findAndCountAll({
		where: whereClause,
		include: [
			{
				model: db.User,
				as: "candidate",
				attributes: ["id", "name", "email", "profile_picture"],
			},
			{
				model: db.User,
				as: "employer",
				attributes: ["id", "name", "email", "profile_picture"],
			},
			{ model: db.Job, as: "job", attributes: ["id", "title"] },
		],
		order: [["scheduled_at", "ASC"]],
		limit: Number(limit),
		offset: Number(offset),
	});

	return {
		interviews: rows,
		total: count,
		currentPage: Number(page),
		totalPages: Math.ceil(count / limit),
	};
};

const updateInterview = async (id, data) => {
	try {
		const interview = await db.Interview.findByPk(id, {
			include: [
				{
					model: db.Job,
					as: "job",
					include: [{ model: db.Company, as: "Company" }],
				},
			],
		});
		if (!interview) throw new Error("Interview not found");

		// Validation: Chặn thời gian quá khứ nếu có cập nhật scheduled_at
		if (data.scheduled_at && moment(data.scheduled_at).isBefore(moment())) {
			throw new Error("Thời gian phỏng vấn mới không được ở trong quá khứ.");
		}

		// Logic phục hồi trạng thái: Nếu lịch đang EXPIRED mà được đổi ngày mới -> Chuyển về PENDING
		if (interview.status === "EXPIRED" && data.scheduled_at) {
			data.status = "PENDING";
			data.is_reminder_sent = false; // Reset lại trạng thái nhắc nhở
		}

		if (
			(interview.status === "PENDING" || interview.status === "EXPIRED") &&
			data.status === "COMPLETED"
		) {
			if (interview.status === "PENDING") {
				throw new Error(
					"Bạn không thể cập nhật trạng thái phỏng vấn thành hoàn thành khi lịch chưa đến hạn.",
				);
			} else if (interview.status === "EXPIRED") {
				throw new Error(
					"Bạn không thể cập nhật trạng thái phỏng vấn thành hoàn thành khi lịch đã hết hạn.",
				);
			}
		}

		await interview.update(data);

		const company = interview.job?.Company;

		// THÔNG BÁO CHO ỨNG VIÊN: Cập nhật lịch chi tiết
		const timeStr = moment(interview.scheduled_at)
			.tz("Asia/Ho_Chi_Minh")
			.format("HH:mm");
		const dateStr = moment(interview.scheduled_at)
			.tz("Asia/Ho_Chi_Minh")
			.format("DD/MM/YYYY");

		await createNotification({
			receiver_id: interview.candidate_id,
			sender_id: interview.employer_id,
			type: "INTERVIEW_UPDATED",
			content: `Cập nhật: Lịch phỏng vấn vị trí ${interview.job?.title} đã thay đổi thời gian`,
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
					Lịch phỏng vấn vị trí <strong style="color: #1e293b;">${interview.job?.title}</strong> của bạn đã được cập nhật thông tin mới:<br><br>
					<strong>Thời gian mới:</strong> ${timeStr} ngày ${dateStr}<br>
					<strong>Hình thức:</strong> ${interview.interview_type === "ONLINE" ? "Phỏng vấn trực tuyến" : "Phỏng vấn trực tiếp"}<br>
					${interview.location ? `<strong>Địa điểm/Link:</strong> ${interview.location}` : ""}
				</div>
			`,
			reference_id: interview.id.toString(),
			send_email: true,
		});

		return interview;
	} catch (error) {
		console.error("Error in updateInterview:", error);
		throw error;
	}
};

const deleteInterview = async (id) => {
	try {
		const interview = await db.Interview.findByPk(id, {
			include: [
				{
					model: db.Job,
					as: "job",
					include: [{ model: db.Company, as: "Company" }],
				},
			],
		});
		if (!interview) throw new Error("Interview not found");

		const company = interview.job?.Company;

		// THÔNG BÁO CHO ỨNG VIÊN: Hủy lịch (Thông báo trước khi xóa)
		await createNotification({
			receiver_id: interview.candidate_id,
			sender_id: interview.employer_id,
			type: "INTERVIEW_CANCELLED",
			content: `Thông báo: Buổi phỏng vấn vị trí ${interview.job?.title} đã bị hủy bỏ`,
			email_content: `
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
					<tr>
						${company?.logo ? `<td width="60" valign="top"><img src="${company.logo}" width="50" height="50" style="border-radius: 8px; display: block; object-fit: cover;" /></td>` : ""}
						<td valign="top" style="padding-left: 15px;">
							<div style="font-size: 17px; font-weight: bold; color: #1e293b;">${company?.name}</div>
						</td>
					</tr>
				</table>
				<div style="font-size: 16px; color: #475569; line-height: 1.6;">
					Rất tiếc, buổi phỏng vấn cho vị trí <strong style="color: #1e293b;">${interview.job?.title}</strong> đã bị hủy bỏ bởi nhà tuyển dụng.<br><br>
					Nếu có thắc mắc, vui lòng liên hệ trực tiếp với công ty để biết thêm chi tiết.
				</div>
			`,
			reference_id: interview.id.toString(),
			send_email: true,
		});

		await interview.destroy();
		return true;
	} catch (error) {
		console.error("Error in deleteInterview:", error);
		throw error;
	}
};

export {
	createInterview,
	updateInterviewStatus,
	getInterviewsByUser,
	updateInterview,
	deleteInterview,
};
