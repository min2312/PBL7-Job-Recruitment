import db from "../models";
import { PayOS } from '@payos/node';
require("dotenv").config();

const payos = new PayOS({
	clientId: process.env.PAY_OS_CLIENT_ID,
	apiKey: process.env.PAY_OS_API_KEY,
	checksumKey: process.env.PAY_OS_CHECKSUM_KEY,
});

const createPaymentLink = async (userId, jobId, domain) => {
	try {
		// 1. Kiểm tra job có tồn tại không
		const job = await db.Job.findByPk(jobId);
		if (!job) {
			return { errCode: 1, errMessage: "Job not found" };
		}

		// 2. Tạo mã đơn hàng duy nhất (chỉ lấy số, tối đa 16 chữ số)
		const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(1000 + Math.random() * 9000));

		// 3. Lưu vào database
		await db.Transaction.create({
			userId: userId,
			jobId: jobId,
			amount: 50000,
			orderCode: orderCode,
			status: "PENDING",
		});

		// 4. Tạo body theo format của PayOS
		const body = {
			orderCode: orderCode,
			amount: 50000,
			description: `DAY TIN ${jobId}`,
			items: [
				{
					name: `Gói Đẩy tin VIP 7 ngày (Job: ${jobId})`,
					quantity: 1,
					price: 50000,
				},
			],
			returnUrl: `${domain}/employer/payment-result?payment=success&orderCode=${orderCode}`,
			cancelUrl: `${domain}/employer/payment-result?payment=cancel&orderCode=${orderCode}`,
		};

		const paymentLinkRes = await payos.paymentRequests.create(body);

		return {
			errCode: 0,
			errMessage: "Tạo link thanh toán thành công",
			data: paymentLinkRes.checkoutUrl,
		};
	} catch (error) {
		console.error("Error creating payment link:", error);
		return { errCode: -1, errMessage: "Lỗi từ server: " + error.message };
	}
};

const handleWebhook = async (webhookBody) => {
	try {
		// Xác thực chữ ký webhook từ PayOS
		const data = await payos.webhooks.verify(webhookBody);
		const webhookData = data.data ? data.data : data;
		if (data.code === "00" || data.success === true || webhookData.code === "00") {
			const orderCode = webhookData.orderCode;
			const transaction = await db.Transaction.findOne({
				where: { orderCode: orderCode },
			});

			if (transaction && transaction.status === "PENDING") {
				// Cập nhật trạng thái giao dịch
				await transaction.update({ status: "SUCCESS" });

				// Cập nhật ngày featured của Job
				const job = await db.Job.findByPk(transaction.jobId);
				if (job) {
					const now = new Date();
					let newDate = new Date();
					
					// Nếu job đang được nổi bật, cộng dồn thêm 7 ngày
					if (job.featuredUntil && new Date(job.featuredUntil) > now) {
						newDate = new Date(new Date(job.featuredUntil).getTime() + 7 * 24 * 60 * 60 * 1000);
					} else {
						newDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
					}
					
					await job.update({ featuredUntil: newDate });

					// Gửi thông báo cho nhà tuyển dụng
					await db.Notification.create({
						receiver_id: transaction.userId,
						type: "SYSTEM",
						content: `Thanh toán thành công 50,000đ. Tin tuyển dụng "${job.title}" đã được ghim lên vị trí nổi bật.`,
					});
				}
			}
		}
		return { errCode: 0, errMessage: "Webhook processed" };
	} catch (error) {
		console.error("Webhook processing error:", error);
		// Không ném lỗi ra ngoài để PayOS nhận HTTP 200 (webhook retry liên tục nếu lỗi)
		return { errCode: -1, errMessage: "Lỗi xử lý webhook" };
	}
};

const getAllTransactions = async ({ page = 1, limit = 10, status = "all", mode = "all", dateValue } = {}) => {
	try {
		const { Op } = db.Sequelize;
		const pageNum = Math.max(1, parseInt(page || "1"));
		const pageSize = Math.max(1, parseInt(limit || "10"));
		const offset = (pageNum - 1) * pageSize;

		const where = {};

		if (status && status !== "all" && status !== "ALL") {
			where.status = status.toUpperCase();
		}

		if (mode && mode !== "all" && mode !== "ALL" && dateValue) {
			let startDate, endDate;
			if (mode.toLowerCase() === "day") {
				startDate = new Date(`${dateValue}T00:00:00.000+07:00`);
				endDate = new Date(`${dateValue}T23:59:59.999+07:00`);
			} else if (mode.toLowerCase() === "month") {
				const [year, month] = dateValue.split("-").map(Number);
				const monthStr = String(month).padStart(2, "0");
				const lastDay = new Date(year, month, 0).getDate();
				startDate = new Date(`${year}-${monthStr}-01T00:00:00.000+07:00`);
				endDate = new Date(`${year}-${monthStr}-${lastDay}T23:59:59.999+07:00`);
			} else if (mode.toLowerCase() === "year") {
				const year = Number(dateValue);
				startDate = new Date(`${year}-01-01T00:00:00.000+07:00`);
				endDate = new Date(`${year}-12-31T23:59:59.999+07:00`);
			}

			if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
				where.createdAt = {
					[Op.between]: [startDate, endDate],
				};
			}
		}

		const statsWhere = { ...where };
		delete statsWhere.status;

		const allStatsRows = await db.Transaction.findAll({
			where: statsWhere,
			attributes: ["amount", "status"],
		});

		let totalRevenue = 0;
		let successCount = 0;
		let pendingCount = 0;
		let cancelledCount = 0;

		allStatsRows.forEach((t) => {
			const s = t.status ? t.status.toUpperCase() : "";
			if (s === "SUCCESS") {
				totalRevenue += Number(t.amount || 0);
				successCount++;
			} else if (s === "PENDING") {
				pendingCount++;
			} else {
				cancelledCount++;
			}
		});

		const { count, rows } = await db.Transaction.findAndCountAll({
			where,
			include: [
				{
					model: db.User,
					attributes: ["id", "name", "email", "profilePicture"],
				},
				{
					model: db.Job,
					attributes: ["id", "title"],
				},
			],
			limit: pageSize,
			offset,
			order: [["createdAt", "DESC"]],
			distinct: true,
		});

		const totalPages = Math.ceil(count / pageSize);

		return {
			errCode: 0,
			errMessage: "Lấy danh sách giao dịch thành công",
			data: rows,
			pagination: {
				page: pageNum,
				limit: pageSize,
				totalPages: totalPages === 0 ? 1 : totalPages,
				totalRecords: count,
			},
			statistics: {
				totalRevenue,
				successCount,
				pendingCount,
				cancelledCount,
			},
		};
	} catch (error) {
		console.error("Error in getAllTransactions:", error);
		return { errCode: -1, errMessage: "Lỗi từ server: " + error.message };
	}
};

const cancelTransaction = async (orderCode) => {
	try {
		const transaction = await db.Transaction.findOne({
			where: { orderCode: orderCode },
		});

		if (transaction && transaction.status === "PENDING") {
			await transaction.update({ status: "CANCELLED" });
		}
		return { errCode: 0, errMessage: "Đã hủy giao dịch" };
	} catch (error) {
		console.error("Error cancelling transaction:", error);
		return { errCode: -1, errMessage: "Lỗi hủy giao dịch: " + error.message };
	}
};

module.exports = {
	createPaymentLink,
	handleWebhook,
	getAllTransactions,
	cancelTransaction,
};
