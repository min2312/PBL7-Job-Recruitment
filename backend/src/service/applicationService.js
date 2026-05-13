import db from "../models/index";
import { createNotification } from "./notificationService";
const {
	syncSingleApplication,
	deleteApplicationRel,
} = require("./syncToNeo4jService");
const { uploadToAzure } = require("./azureStorageService");

const handleApplyJob = async (data, file) => {
	try {
		const { jobId, userId, useExistingCv } = data;

		if (!jobId || !userId) {
			return {
				errCode: 1,
				errMessage: "Missing required parameters (jobId, userId)",
			};
		}

		// Check if already applied
		const existingApp = await db.Application.findOne({
			where: { jobId, userId },
		});

		if (existingApp) {
			return {
				errCode: 2,
				errMessage: "Bạn đã ứng tuyển vào công việc này",
			};
		}

		let cvUrl = "";

		if (useExistingCv === "true" || useExistingCv === true) {
			// Option 1: Use existing CV from user profile
			const user = await db.User.findByPk(userId);
			if (!user || !user.cv_file) {
				return {
					errCode: 3,
					errMessage: "Bạn chưa có file CV trong hồ sơ. Hãy upload file CV mới",
				};
			}
			cvUrl = user.cv_file;
		} else if (file) {
			// Option 2: Use newly uploaded file
			cvUrl = await uploadToAzure(
				file.buffer,
				file.originalname,
				file.mimetype,
			);
		} else {
			return {
				errCode: 4,
				errMessage:
					"Hãy cung cấp file CV hoặc sử dụng file CV đã có trong hồ sơ",
			};
		}

		// Create application record
		const application = await db.Application.create({
			userId,
			jobId,
			cv_file: cvUrl,
			status: "pending",
		});

		// Sync to Neo4j
		await syncSingleApplication(application.id);

		return {
			errCode: 0,
			errMessage: "Bạn đã ứng tuyển thành công!",
			data: application,
		};
	} catch (error) {
		console.error("Error in handleApplyJob service:", error);
		return {
			errCode: -1,
			errMessage: "Internal server error",
		};
	}
};

const getApplicationsByEmployer = async (
	companyId,
	{ jobId, status, candidateName, page = 1, limit = 10 },
) => {
	try {
		const { Op } = db.Sequelize;
		const pageNum = Math.max(1, parseInt(page || "1"));
		const pageSize = Math.max(1, parseInt(limit || "10"));
		const offset = (pageNum - 1) * pageSize;

		const where = {};
		if (status && status !== "all") {
			where.status = status;
		}
		if (jobId) {
			where.jobId = jobId;
		}

		const userWhere = {};
		if (candidateName) {
			userWhere.name = { [Op.like]: `%${candidateName}%` };
		}

		const { count, rows } = await db.Application.findAndCountAll({
			where,
			include: [
				{
					model: db.Job,
					required: true,
					where: { companyId },
				},
				{
					model: db.User,
					required: true,
					where: userWhere,
					attributes: ["id", "name", "email", "phone", "profilePicture"],
				},
			],
			limit: pageSize,
			offset,
			order: [["createdAt", "DESC"]],
			distinct: true,
		});

		return {
			errCode: 0,
			data: {
				total: count,
				page: pageNum,
				limit: pageSize,
				applications: rows,
			},
		};
	} catch (error) {
		console.error("Error in getApplicationsByEmployer service:", error);
		return { errCode: -1, errMessage: "Error fetching applications" };
	}
};

const getApplicationsByUser = async (userId) => {
	try {
		const apps = await db.Application.findAll({
			where: { userId },
			include: [
				{
					model: db.Job,
					include: [
						{ model: db.Company, as: "Company" },
						{ model: db.Location, as: "locations" },
					],
				},
			],
			order: [["createdAt", "DESC"]],
		});
		return {
			errCode: 0,
			data: apps,
		};
	} catch (error) {
		console.error("Error in getApplicationsByUser service:", error);
		return { errCode: -1, errMessage: "Error fetching applications" };
	}
};

const handleCancelApplication = async (userId, jobId) => {
	try {
		if (!userId || !jobId) {
			return {
				errCode: 1,
				errMessage: "Missing required parameters",
			};
		}

		const application = await db.Application.findOne({
			where: { userId, jobId },
		});

		if (!application) {
			return {
				errCode: 2,
				errMessage: "Bạn chưa ứng tuyển vào công việc này",
			};
		}

		// Optional: Only allow cancelling if status is 'pending'
		if (application.status !== "pending") {
			return {
				errCode: 3,
				errMessage: "Không thể huỷ ứng tuyển vào công việc này",
			};
		}

		await application.destroy();

		// Sync to Neo4j
		await deleteApplicationRel(userId, jobId);

		return {
			errCode: 0,
			errMessage: "Bạn đã huỷ ứng tuyển thành công!",
		};
	} catch (error) {
		console.error("Error in handleCancelApplication service:", error);
		return {
			errCode: -1,
			errMessage: "Internal server error",
		};
	}
};

const getApplicationById = async (applicationId) => {
	try {
		const application = await db.Application.findByPk(applicationId, {
			include: [
				{
					model: db.Job,
					include: [
						{ model: db.Company, as: "Company" },
						{ model: db.Location, as: "locations" },
					],
				},
				{
					model: db.User,
					attributes: [
						"id",
						"name",
						"email",
						"phone",
						"profilePicture",
						"description",
						"cv_file",
					],
				},
			],
		});

		if (!application) {
			return { errCode: 1, errMessage: "Application not found" };
		}

		return { errCode: 0, data: application };
	} catch (error) {
		console.error("Error in getApplicationById service:", error);
		return { errCode: -1, errMessage: "Internal server error" };
	}
};

const updateApplicationStatus = async (applicationId, status) => {
	try {
		const application = await db.Application.findByPk(applicationId, {
			include: [
				{
					model: db.Job,
					include: [{ model: db.Company, as: "Company" }],
				},
			],
		});
		if (!application) {
			return {
				errCode: 1,
				errMessage: "Application not found",
			};
		}

		// Validate status
		const validStatuses = ["pending", "interview", "approved", "rejected"];
		if (!validStatuses.includes(status)) {
			return {
				errCode: 2,
				errMessage: "Invalid status",
			};
		}

		application.status = status;
		await application.save();

		// THÔNG BÁO CHO ỨNG VIÊN: Chỉ khi Duyệt hoặc Từ chối
		if (status === "approved" || status === "rejected") {
			const statusMsg =
				status === "approved"
					? '<span style="color: #10b981; font-weight: bold;">Chúc mừng! Hồ sơ của bạn đã được duyệt thành công.</span>'
					: '<span style="color: #ef4444; font-weight: bold;">Rất tiếc, hồ sơ của bạn không phù hợp với vị trí này.</span>';

			const company = application.Job?.Company;

			await createNotification({
				receiver_id: application.userId,
				sender_id: company?.id,
				type: "APPLICATION_STATUS_UPDATE",
				content: `Hồ sơ vị trí ${application.Job?.title}: ${status === "approved" ? "Đã được duyệt" : "Không phù hợp"}`,
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
						Thông báo về hồ sơ ứng tuyển vị trí: <strong style="color: #1e293b;">${application.Job?.title}</strong><br><br>
						${statusMsg}
					</div>
				`,
				reference_id: application.id.toString(),
				send_email: true,
			});
		}

		// Sync to Neo4j
		await syncSingleApplication(applicationId);

		return {
			errCode: 0,
			errMessage: "Status updated successfully",
			data: application,
		};
	} catch (error) {
		console.error("Error in updateApplicationStatus service:", error);
		return {
			errCode: -1,
			errMessage: "Internal server error",
		};
	}
};

const getAllApplicationsByEmployer = async (companyId) => {
	try {
		const rows = await db.Application.findAll({
			include: [
				{
					model: db.Job,
					required: true,
					where: { companyId },
				},
				{
					model: db.User,
					required: true,
					attributes: ["id", "name", "email", "phone", "profilePicture"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		return {
			errCode: 0,
			data: rows,
		};
	} catch (error) {
		console.error("Error in getAllApplicationsByEmployer service:", error);
		return { errCode: -1, errMessage: "Error fetching applications" };
	}
};

module.exports = {
	handleApplyJob,
	getApplicationsByUser,
	getApplicationsByEmployer,
	getAllApplicationsByEmployer,
	handleCancelApplication,
	updateApplicationStatus,
	getApplicationById,
};
